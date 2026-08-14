-- ============================================================
-- MenuQR — Direct Kitchen Order System Migration
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/okqdturtuukfazjwfzcq/sql
-- ============================================================

-- orders table: live kitchen orders (replaces WhatsApp flow)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT,
  customer_name TEXT,
  order_type TEXT NOT NULL DEFAULT 'dine_in',  -- dine_in | takeaway | delivery
  order_items JSONB NOT NULL DEFAULT '[]',
  order_summary TEXT NOT NULL DEFAULT '',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',  -- new | preparing | ready | done
  notes TEXT,
  source TEXT DEFAULT 'qr',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated ON orders;
CREATE TRIGGER orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(restaurant_id, status);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone can place an order (customers — no auth needed)
DROP POLICY IF EXISTS "public_insert_orders_v2" ON orders;
CREATE POLICY "public_insert_orders_v2" ON orders
  FOR INSERT WITH CHECK (TRUE);

-- Anyone can read orders (kitchen display is a public URL)
DROP POLICY IF EXISTS "public_read_orders_v2" ON orders;
CREATE POLICY "public_read_orders_v2" ON orders
  FOR SELECT USING (TRUE);

-- Only restaurant owner can update status
DROP POLICY IF EXISTS "owner_update_orders_v2" ON orders;
CREATE POLICY "owner_update_orders_v2" ON orders
  FOR UPDATE USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_user_id = auth.uid())
  );

-- Enable realtime for live kitchen display
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
