-- ============================================
-- RAM Dosya Atama - Cases Table Migration
-- Week 5-8: Move cases from JSONB to dedicated table
-- ============================================

-- 1. Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  student TEXT NOT NULL,
  score NUMERIC NOT NULL CHECK (score >= 0),
  assigned_to TEXT REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL,
  type TEXT CHECK (type IN ('DESTEK', 'İLK', 'KONTROL', 'RAPOR')),
  is_new BOOLEAN DEFAULT FALSE,
  is_test BOOLEAN DEFAULT FALSE,
  absence_penalty BOOLEAN DEFAULT FALSE,
  backup_bonus BOOLEAN DEFAULT FALSE,
  assign_reason TEXT,
  diag_count INTEGER DEFAULT 0,

  -- Metadata
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for foreign key
  CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to) REFERENCES teachers(id)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);
CREATE INDEX IF NOT EXISTS idx_cases_is_test ON cases(is_test);
CREATE INDEX IF NOT EXISTS idx_cases_absence_penalty ON cases(absence_penalty);
CREATE INDEX IF NOT EXISTS idx_cases_type ON cases(type);
CREATE INDEX IF NOT EXISTS idx_cases_date ON cases(DATE(created_at));

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_cases_assigned_date ON cases(assigned_to, DATE(created_at));

-- 3. Auto-update triggers
CREATE OR REPLACE FUNCTION update_cases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = COALESCE(OLD.version, 0) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_updated_at
BEFORE UPDATE ON cases
FOR EACH ROW
EXECUTE FUNCTION update_cases_updated_at();

-- 4. RPC: Get cases by teacher and date range
CREATE OR REPLACE FUNCTION get_teacher_cases(
  teacher_id TEXT,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  student TEXT,
  score NUMERIC,
  assigned_to TEXT,
  created_at TIMESTAMPTZ,
  type TEXT,
  is_new BOOLEAN,
  is_test BOOLEAN,
  absence_penalty BOOLEAN,
  backup_bonus BOOLEAN,
  assign_reason TEXT,
  diag_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.student, c.score, c.assigned_to, c.created_at,
         c.type, c.is_new, c.is_test, c.absence_penalty,
         c.backup_bonus, c.assign_reason, c.diag_count
  FROM cases c
  WHERE c.assigned_to = teacher_id
    AND (start_date IS NULL OR DATE(c.created_at) >= start_date)
    AND (end_date IS NULL OR DATE(c.created_at) <= end_date)
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. RPC: Get cases by date
CREATE OR REPLACE FUNCTION get_cases_by_date(target_date DATE)
RETURNS TABLE (
  id TEXT,
  student TEXT,
  score NUMERIC,
  assigned_to TEXT,
  created_at TIMESTAMPTZ,
  type TEXT,
  is_new BOOLEAN,
  is_test BOOLEAN,
  absence_penalty BOOLEAN,
  assign_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.student, c.score, c.assigned_to, c.created_at,
         c.type, c.is_new, c.is_test, c.absence_penalty, c.assign_reason
  FROM cases c
  WHERE DATE(c.created_at) = target_date
  ORDER BY c.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 6. RPC: Count cases for teacher today
CREATE OR REPLACE FUNCTION count_teacher_cases_today(teacher_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  case_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO case_count
  FROM cases
  WHERE assigned_to = teacher_id
    AND DATE(created_at) = CURRENT_DATE
    AND absence_penalty = FALSE;

  RETURN case_count;
END;
$$ LANGUAGE plpgsql;

-- 7. RPC: Batch sync cases
CREATE OR REPLACE FUNCTION sync_cases(cases_data JSONB)
RETURNS TABLE (
  success BOOLEAN,
  synced_count INTEGER,
  error TEXT
) AS $$
DECLARE
  case_record JSONB;
  synced INTEGER := 0;
BEGIN
  FOR case_record IN SELECT * FROM jsonb_array_elements(cases_data)
  LOOP
    INSERT INTO cases (
      id, student, score, assigned_to, created_at, type,
      is_new, is_test, absence_penalty, backup_bonus,
      assign_reason, diag_count
    )
    VALUES (
      case_record->>'id',
      case_record->>'student',
      (case_record->>'score')::NUMERIC,
      case_record->>'assignedTo',
      (case_record->>'createdAt')::TIMESTAMPTZ,
      case_record->>'type',
      COALESCE((case_record->>'isNew')::BOOLEAN, false),
      COALESCE((case_record->>'isTest')::BOOLEAN, false),
      COALESCE((case_record->>'absencePenalty')::BOOLEAN, false),
      COALESCE((case_record->>'backupBonus')::BOOLEAN, false),
      case_record->>'assignReason',
      COALESCE((case_record->>'diagCount')::INTEGER, 0)
    )
    ON CONFLICT (id) DO UPDATE SET
      student = EXCLUDED.student,
      score = EXCLUDED.score,
      assigned_to = EXCLUDED.assigned_to,
      type = EXCLUDED.type,
      is_new = EXCLUDED.is_new,
      is_test = EXCLUDED.is_test,
      absence_penalty = EXCLUDED.absence_penalty,
      backup_bonus = EXCLUDED.backup_bonus,
      assign_reason = EXCLUDED.assign_reason,
      diag_count = EXCLUDED.diag_count;

    synced := synced + 1;
  END LOOP;

  RETURN QUERY SELECT TRUE, synced, NULL::TEXT;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, 0, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 8. Migration helper: Copy cases from app_state
/*
DO $$
DECLARE
  state_cases JSONB;
BEGIN
  SELECT state->'cases' INTO state_cases
  FROM app_state
  WHERE id = 'global';

  PERFORM sync_cases(state_cases);

  RAISE NOTICE 'Cases migrated successfully';
END $$;
*/

-- 9. Comments
COMMENT ON TABLE cases IS 'Cases table - separated from app_state for better querying';
COMMENT ON COLUMN cases.assigned_to IS 'Foreign key to teachers table';
COMMENT ON FUNCTION get_teacher_cases IS 'Get all cases for a teacher in date range';
COMMENT ON FUNCTION count_teacher_cases_today IS 'Count non-penalty cases for teacher today';
