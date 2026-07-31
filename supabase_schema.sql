-- ============================================================
-- MenuQR India — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- RESTAURANTS
-- ============================================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity
  name_en TEXT NOT NULL,
  name_hi TEXT,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  cuisine_type TEXT,

  -- Contact
  whatsapp_number TEXT NOT NULL,
  phone TEXT,
  address_en TEXT,
  area TEXT,
  google_maps_url TEXT,

  -- Menu settings
  currency TEXT NOT NULL DEFAULT 'INR',
  gst_percentage NUMERIC(4,2) DEFAULT 5.0,
  gst_type TEXT DEFAULT 'exclusive',   -- 'inclusive' | 'exclusive'
  show_gst BOOLEAN DEFAULT TRUE,
  is_veg_only BOOLEAN DEFAULT FALSE,
  default_language TEXT DEFAULT 'en',
  accept_orders BOOLEAN DEFAULT TRUE,
  operating_hours JSONB,

  -- Subscription
  plan TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_active BOOLEAN DEFAULT FALSE,
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  monthly_fee_inr NUMERIC(8,2) DEFAULT 499,

  -- Stats
  total_menu_views INTEGER DEFAULT 0,
  total_whatsapp_orders INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MENU CATEGORIES
-- ============================================================
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  available_from TIME,
  available_until TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MENU ITEMS
-- ============================================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,

  name_en TEXT NOT NULL,
  name_hi TEXT,
  description_en TEXT,
  description_hi TEXT,

  price NUMERIC(8,2) NOT NULL,
  original_price NUMERIC(8,2),

  image_url TEXT,

  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_spicy BOOLEAN DEFAULT FALSE,
  is_veg BOOLEAN DEFAULT TRUE,
  is_jain BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,

  allergens TEXT[],
  customisation_groups JSONB DEFAULT '[]',

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESTAURANT TABLES
-- ============================================================
CREATE TABLE restaurant_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  table_label_en TEXT,
  section TEXT,
  seats INTEGER,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, table_number)
);

-- ============================================================
-- ORDER LOGS
-- ============================================================
CREATE TABLE order_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT,
  order_type TEXT DEFAULT 'dine_in',
  order_summary TEXT NOT NULL,
  order_items JSONB NOT NULL,
  subtotal NUMERIC(10,2),
  gst_amount NUMERIC(10,2),
  total_amount NUMERIC(10,2),
  customer_name TEXT,
  customer_phone TEXT,
  source TEXT DEFAULT 'qr',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MENU VIEWS (analytics)
-- ============================================================
CREATE TABLE menu_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT,
  source TEXT,
  language TEXT DEFAULT 'en',
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_owner ON restaurants(owner_user_id);
CREATE INDEX idx_categories_restaurant ON menu_categories(restaurant_id, sort_order);
CREATE INDEX idx_items_category ON menu_items(category_id, sort_order);
CREATE INDEX idx_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_order_logs_restaurant ON order_logs(restaurant_id, created_at DESC);
CREATE INDEX idx_menu_views_restaurant ON menu_views(restaurant_id, viewed_at DESC);

-- ============================================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_updated BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER items_updated BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- HELPER FUNCTIONS (for analytics counters)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_view_count(rid UUID)
RETURNS void AS $$
  UPDATE restaurants SET total_menu_views = total_menu_views + 1 WHERE id = rid;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION increment_order_count(rid UUID)
RETURNS void AS $$
  UPDATE restaurants SET total_whatsapp_orders = total_whatsapp_orders + 1 WHERE id = rid;
$$ LANGUAGE sql;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_only" ON restaurants
  FOR ALL USING (owner_user_id = auth.uid());
CREATE POLICY "public_read_restaurants" ON restaurants
  FOR SELECT USING (TRUE);

ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_categories" ON menu_categories FOR ALL
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_user_id = auth.uid()));
CREATE POLICY "public_read_categories" ON menu_categories FOR SELECT USING (TRUE);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_items" ON menu_items FOR ALL
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_user_id = auth.uid()));
CREATE POLICY "public_read_items" ON menu_items FOR SELECT USING (TRUE);

ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_tables" ON restaurant_tables FOR ALL
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_user_id = auth.uid()));

ALTER TABLE order_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_orders" ON order_logs FOR ALL
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_user_id = auth.uid()));
CREATE POLICY "public_insert_orders" ON order_logs FOR INSERT WITH CHECK (TRUE);

ALTER TABLE menu_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_views" ON menu_views FOR ALL
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_user_id = auth.uid()));
CREATE POLICY "public_insert_views" ON menu_views FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- DEMO DATA — "Spice Garden" restaurant (optional)
-- Run AFTER signing up your first account to test the menu
-- Replace 'YOUR_USER_UUID' with your actual Supabase auth user ID
-- ============================================================

/*
INSERT INTO restaurants (owner_user_id, name_en, name_hi, slug, whatsapp_number, cuisine_type, area, currency, gst_percentage)
VALUES ('YOUR_USER_UUID', 'Spice Garden', 'स्पाइस गार्डन', 'spice-garden', '+919876543210', 'North Indian', 'Koramangala', 'INR', 5);

-- Get the restaurant id first, then add categories and items
-- See README for full demo seeding script
*/
