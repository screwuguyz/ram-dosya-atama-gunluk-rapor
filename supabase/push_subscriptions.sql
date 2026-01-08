-- Push Subscriptions Table for PWA Web Push
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster teacher lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_teacher_id ON push_subscriptions(teacher_id);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service role
CREATE POLICY "Service role full access" ON push_subscriptions
  FOR ALL USING (true) WITH CHECK (true);
