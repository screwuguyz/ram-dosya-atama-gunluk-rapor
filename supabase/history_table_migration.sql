-- ============================================
-- RAM Dosya Atama - History Table Migration
-- Week 9-12: Move history from JSONB to partitioned table
-- ============================================

-- 1. Create history table (partitioned by date for performance)
CREATE TABLE IF NOT EXISTS history (
  id TEXT NOT NULL,
  date DATE NOT NULL,
  student TEXT NOT NULL,
  score NUMERIC NOT NULL,
  assigned_to TEXT,
  type TEXT,
  is_test BOOLEAN DEFAULT FALSE,
  absence_penalty BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL,

  -- Composite primary key
  PRIMARY KEY (date, id)
) PARTITION BY RANGE (date);

-- 2. Create partitions for current and recent months
-- (Add more as needed)
CREATE TABLE IF NOT EXISTS history_2025_01 PARTITION OF history
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE IF NOT EXISTS history_2025_02 PARTITION OF history
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE IF NOT EXISTS history_2025_03 PARTITION OF history
FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

CREATE TABLE IF NOT EXISTS history_2025_04 PARTITION OF history
FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

CREATE TABLE IF NOT EXISTS history_2025_05 PARTITION OF history
FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

CREATE TABLE IF NOT EXISTS history_2025_06 PARTITION OF history
FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

CREATE TABLE IF NOT EXISTS history_2025_07 PARTITION OF history
FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

CREATE TABLE IF NOT EXISTS history_2025_08 PARTITION OF history
FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE IF NOT EXISTS history_2025_09 PARTITION OF history
FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE IF NOT EXISTS history_2025_10 PARTITION OF history
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE IF NOT EXISTS history_2025_11 PARTITION OF history
FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE IF NOT EXISTS history_2025_12 PARTITION OF history
FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE TABLE IF NOT EXISTS history_2026_01 PARTITION OF history
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Create default partition for future dates
CREATE TABLE IF NOT EXISTS history_default PARTITION OF history DEFAULT;

-- 3. Create indexes on partitioned table
CREATE INDEX IF NOT EXISTS idx_history_assigned_to ON history(assigned_to);
CREATE INDEX IF NOT EXISTS idx_history_date ON history(date);
CREATE INDEX IF NOT EXISTS idx_history_type ON history(type);

-- 4. RPC: Get history for date range
CREATE OR REPLACE FUNCTION get_history_range(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  id TEXT,
  date DATE,
  student TEXT,
  score NUMERIC,
  assigned_to TEXT,
  type TEXT,
  is_test BOOLEAN,
  absence_penalty BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT h.id, h.date, h.student, h.score, h.assigned_to,
         h.type, h.is_test, h.absence_penalty, h.created_at
  FROM history h
  WHERE h.date >= start_date AND h.date <= end_date
  ORDER BY h.date DESC, h.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. RPC: Get teacher history
CREATE OR REPLACE FUNCTION get_teacher_history(
  teacher_id TEXT,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  date DATE,
  student TEXT,
  score NUMERIC,
  type TEXT,
  is_test BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT h.id, h.date, h.student, h.score, h.type, h.is_test
  FROM history h
  WHERE h.assigned_to = teacher_id
    AND (start_date IS NULL OR h.date >= start_date)
    AND (end_date IS NULL OR h.date <= end_date)
  ORDER BY h.date DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. RPC: Calculate teacher score for date range
CREATE OR REPLACE FUNCTION calculate_teacher_score(
  teacher_id TEXT,
  start_date DATE,
  end_date DATE
)
RETURNS NUMERIC AS $$
DECLARE
  total_score NUMERIC;
BEGIN
  SELECT COALESCE(SUM(score), 0) INTO total_score
  FROM history
  WHERE assigned_to = teacher_id
    AND date >= start_date
    AND date <= end_date;

  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- 7. RPC: Sync history from JSONB
CREATE OR REPLACE FUNCTION sync_history(history_data JSONB)
RETURNS TABLE (
  success BOOLEAN,
  synced_count INTEGER,
  error TEXT
) AS $$
DECLARE
  date_key TEXT;
  date_cases JSONB;
  case_record JSONB;
  synced INTEGER := 0;
  target_date DATE;
BEGIN
  -- Loop through each date in history
  FOR date_key IN SELECT jsonb_object_keys(history_data)
  LOOP
    target_date := date_key::DATE;
    date_cases := history_data->date_key;

    -- Loop through cases for this date
    FOR case_record IN SELECT * FROM jsonb_array_elements(date_cases)
    LOOP
      INSERT INTO history (
        id, date, student, score, assigned_to, type,
        is_test, absence_penalty, created_at
      )
      VALUES (
        case_record->>'id',
        target_date,
        case_record->>'student',
        (case_record->>'score')::NUMERIC,
        case_record->>'assignedTo',
        case_record->>'type',
        COALESCE((case_record->>'isTest')::BOOLEAN, false),
        COALESCE((case_record->>'absencePenalty')::BOOLEAN, false),
        COALESCE((case_record->>'createdAt')::TIMESTAMPTZ, target_date::TIMESTAMPTZ)
      )
      ON CONFLICT (date, id) DO UPDATE SET
        student = EXCLUDED.student,
        score = EXCLUDED.score,
        assigned_to = EXCLUDED.assigned_to,
        type = EXCLUDED.type,
        is_test = EXCLUDED.is_test,
        absence_penalty = EXCLUDED.absence_penalty;

      synced := synced + 1;
    END LOOP;
  END LOOP;

  RETURN QUERY SELECT TRUE, synced, NULL::TEXT;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, 0, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to auto-create partitions
CREATE OR REPLACE FUNCTION create_history_partition(target_year INTEGER, target_month INTEGER)
RETURNS VOID AS $$
DECLARE
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  partition_name := 'history_' || target_year || '_' || LPAD(target_month::TEXT, 2, '0');
  start_date := (target_year || '-' || target_month || '-01')::DATE;
  end_date := start_date + INTERVAL '1 month';

  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF history FOR VALUES FROM (%L) TO (%L)',
    partition_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;

-- 9. Migration helper
/*
DO $$
DECLARE
  state_history JSONB;
BEGIN
  SELECT state->'history' INTO state_history
  FROM app_state
  WHERE id = 'global';

  PERFORM sync_history(state_history);

  RAISE NOTICE 'History migrated successfully';
END $$;
*/

-- 10. Comments
COMMENT ON TABLE history IS 'History table - partitioned by date for optimal query performance';
COMMENT ON FUNCTION get_history_range IS 'Get history records for date range';
COMMENT ON FUNCTION calculate_teacher_score IS 'Calculate total score for teacher in date range';
COMMENT ON FUNCTION create_history_partition IS 'Auto-create partition for given year/month';
