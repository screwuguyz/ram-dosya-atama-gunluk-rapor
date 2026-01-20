-- ============================================
-- RAM Dosya Atama - Teachers Table Migration
-- Week 2-4: Move teachers from JSONB to dedicated table
-- ============================================

-- 1. Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score NUMERIC DEFAULT 0 CHECK (score >= 0),
  yearly_load NUMERIC DEFAULT 0 CHECK (yearly_load >= 0),
  monthly JSONB DEFAULT '{}'::jsonb,
  is_absent BOOLEAN DEFAULT FALSE,
  backup_day TEXT,
  is_tester BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  pushover_key TEXT,
  is_physiotherapist BOOLEAN DEFAULT FALSE,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Version for optimistic locking
  version INTEGER DEFAULT 1
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teachers_active ON teachers(active);
CREATE INDEX IF NOT EXISTS idx_teachers_is_absent ON teachers(is_absent);
CREATE INDEX IF NOT EXISTS idx_teachers_is_tester ON teachers(is_tester);
CREATE INDEX IF NOT EXISTS idx_teachers_yearly_load ON teachers(yearly_load);
CREATE INDEX IF NOT EXISTS idx_teachers_version ON teachers(version);
CREATE INDEX IF NOT EXISTS idx_teachers_updated_at ON teachers(updated_at);

-- 3. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_teachers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = COALESCE(OLD.version, 0) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teachers_updated_at
BEFORE UPDATE ON teachers
FOR EACH ROW
EXECUTE FUNCTION update_teachers_updated_at();

-- 4. RPC: Get teacher by ID with version
CREATE OR REPLACE FUNCTION get_teacher_by_id(teacher_id TEXT)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  score NUMERIC,
  yearly_load NUMERIC,
  monthly JSONB,
  is_absent BOOLEAN,
  backup_day TEXT,
  is_tester BOOLEAN,
  active BOOLEAN,
  pushover_key TEXT,
  version INTEGER,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.score, t.yearly_load, t.monthly,
         t.is_absent, t.backup_day, t.is_tester, t.active,
         t.pushover_key, t.version, t.updated_at
  FROM teachers t
  WHERE t.id = teacher_id;
END;
$$ LANGUAGE plpgsql;

-- 5. RPC: Update teacher score (atomic)
CREATE OR REPLACE FUNCTION update_teacher_score(
  teacher_id TEXT,
  score_delta NUMERIC,
  expected_version INTEGER DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_version INTEGER,
  new_score NUMERIC,
  error TEXT
) AS $$
DECLARE
  current_version INTEGER;
  current_score NUMERIC;
  new_score_val NUMERIC;
  new_version_val INTEGER;
BEGIN
  -- Get current values
  SELECT version, score INTO current_version, current_score
  FROM teachers
  WHERE id = teacher_id
  FOR UPDATE;

  -- Check if teacher exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 0::NUMERIC, 'Teacher not found';
    RETURN;
  END IF;

  -- Check version conflict (optimistic locking)
  IF expected_version IS NOT NULL AND current_version != expected_version THEN
    RETURN QUERY SELECT FALSE, current_version, current_score, 'Version conflict';
    RETURN;
  END IF;

  -- Calculate new score
  new_score_val := current_score + score_delta;

  -- Ensure score doesn't go negative
  IF new_score_val < 0 THEN
    new_score_val := 0;
  END IF;

  -- Update
  UPDATE teachers
  SET score = new_score_val,
      yearly_load = yearly_load + score_delta
  WHERE id = teacher_id
  RETURNING version, score INTO new_version_val, new_score_val;

  RETURN QUERY SELECT TRUE, new_version_val, new_score_val, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 6. RPC: Batch update teachers (for sync)
CREATE OR REPLACE FUNCTION sync_teachers(teachers_data JSONB)
RETURNS TABLE (
  success BOOLEAN,
  synced_count INTEGER,
  error TEXT
) AS $$
DECLARE
  teacher_record JSONB;
  synced INTEGER := 0;
BEGIN
  -- Loop through each teacher in the array
  FOR teacher_record IN SELECT * FROM jsonb_array_elements(teachers_data)
  LOOP
      id, name, score, yearly_load, monthly, is_absent,
      backup_day, is_tester, active, pushover_key,
      is_physiotherapist, birth_date
    )
    VALUES (
      teacher_record->>'id',
      teacher_record->>'name',
      COALESCE((teacher_record->>'score')::NUMERIC, 0),
      COALESCE((teacher_record->>'yearlyLoad')::NUMERIC, 0),
      COALESCE(teacher_record->'monthly', '{}'::jsonb),
      COALESCE((teacher_record->>'isAbsent')::BOOLEAN, false),
      teacher_record->>'backupDay',
      COALESCE((teacher_record->>'isTester')::BOOLEAN, false),
      COALESCE((teacher_record->>'active')::BOOLEAN, true),
      teacher_record->>'pushoverKey',
      COALESCE((teacher_record->>'isPhysiotherapist')::BOOLEAN, false),
      (teacher_record->>'birthDate')::DATE
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      score = EXCLUDED.score,
      yearly_load = EXCLUDED.yearly_load,
      monthly = EXCLUDED.monthly,
      is_absent = EXCLUDED.is_absent,
      backup_day = EXCLUDED.backup_day,
      is_tester = EXCLUDED.is_tester,
      active = EXCLUDED.active,
      pushover_key = EXCLUDED.pushover_key,
      is_physiotherapist = EXCLUDED.is_physiotherapist,
      birth_date = EXCLUDED.birth_date;

    synced := synced + 1;
  END LOOP;

  RETURN QUERY SELECT TRUE, synced, NULL::TEXT;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, 0, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 7. Migration: Copy existing teachers from app_state
-- This is a one-time operation, run manually after creating the table
-- Uncomment and run when ready to migrate:

/*
DO $$
DECLARE
  state_teachers JSONB;
BEGIN
  -- Get teachers from app_state
  SELECT state->'teachers' INTO state_teachers
  FROM app_state
  WHERE id = 'global';

  -- Sync to teachers table
  PERFORM sync_teachers(state_teachers);

  RAISE NOTICE 'Teachers migrated successfully';
END $$;
*/

-- 8. Comments for documentation
COMMENT ON TABLE teachers IS 'Teachers table - separated from app_state JSONB for better performance';
COMMENT ON COLUMN teachers.version IS 'Optimistic locking version, auto-incremented on update';
COMMENT ON COLUMN teachers.monthly IS 'Monthly scores stored as JSONB {YYYY-MM: score}';
COMMENT ON FUNCTION update_teacher_score IS 'Atomically update teacher score with conflict detection';
COMMENT ON FUNCTION sync_teachers IS 'Batch sync teachers from app_state to teachers table';
