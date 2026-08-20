-- ============================================================
-- MenuQR — Payment & Developer Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add developer flag to restaurants table
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS is_developer_account BOOLEAN DEFAULT FALSE;

-- 2. payment_logs table — tracks every Razorpay transaction
CREATE TABLE IF NOT EXISTS payment_logs (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id        UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  razorpay_signature   TEXT,
  amount_inr           NUMERIC(8,2) NOT NULL DEFAULT 299,
  status               TEXT NOT NULL DEFAULT 'pending', -- pending | success | failed
  payment_type         TEXT NOT NULL DEFAULT 'signup',  -- signup | renewal
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_restaurant ON payment_logs(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(razorpay_order_id);

-- RLS for payment_logs
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "owner_payment_logs" ON payment_logs
  FOR SELECT USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_user_id = auth.uid())
  );

-- Service role can insert (used by API routes)
CREATE POLICY IF NOT EXISTS "service_insert_payment_logs" ON payment_logs
  FOR INSERT WITH CHECK (TRUE);

-- 3. Update plan values — developer plan never expires
-- Developer accounts: is_developer_account = TRUE, subscription_active = TRUE, subscription_ends_at = NULL

-- 4. Helper: mark an account as developer by email (run manually for your account)
-- UPDATE restaurants
--   SET is_developer_account = TRUE,
--       plan = 'developer',
--       subscription_active = TRUE,
--       subscription_ends_at = NULL
--   WHERE owner_user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE');
