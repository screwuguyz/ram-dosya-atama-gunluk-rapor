-- ============================================
-- RAM Dosya Atama - Versioning System
-- ============================================
-- Run this SQL in Supabase SQL Editor

-- Add version column to app_state table
ALTER TABLE app_state 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_app_state_version ON app_state(version);

-- Add version to state jsonb (for backward compatibility)
UPDATE app_state 
SET state = jsonb_set(state, '{version}', '1'::jsonb, true)
WHERE id = 'global' AND state->'version' IS NULL;

-- Function to auto-increment version on update
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = COALESCE(OLD.version, 0) + 1;
    NEW.state = jsonb_set(NEW.state, '{version}', to_jsonb(NEW.version), true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment version
DROP TRIGGER IF EXISTS auto_increment_version ON app_state;
CREATE TRIGGER auto_increment_version
BEFORE UPDATE ON app_state
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- Add updated_by column for audit trail
ALTER TABLE app_state
ADD COLUMN IF NOT EXISTS updated_by TEXT DEFAULT 'system';

-- Comment
COMMENT ON COLUMN app_state.version IS 'Auto-incremented version number for optimistic locking';
COMMENT ON COLUMN app_state.updated_by IS 'Client ID or user who made the update';
