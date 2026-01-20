-- RAM Dosya Atama - Teachers Table Fix
-- Adds missing columns (is_physiotherapist, birth_date) and updates functions

-- 1. Add missing columns
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_physiotherapist BOOLEAN DEFAULT FALSE;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS birth_date DATE DEFAULT NULL;

-- 2. Create index for is_physiotherapist
CREATE INDEX IF NOT EXISTS idx_teachers_is_physiotherapist ON teachers(is_physiotherapist);

-- 3. Update get_teacher_by_id function to include new columns
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
  is_physiotherapist BOOLEAN,
  birth_date DATE,
  version INTEGER,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.score, t.yearly_load, t.monthly,
         t.is_absent, t.backup_day, t.is_tester, t.active,
         t.pushover_key, t.is_physiotherapist, t.birth_date,
         t.version, t.updated_at
  FROM teachers t
  WHERE t.id = teacher_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Update sync_teachers function to include new columns
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
    INSERT INTO teachers (
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

-- 5. Update update_teacher_score (no change needed as it only touches score)
