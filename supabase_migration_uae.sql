-- ============================================================
-- MenuQR.ae — UAE Migration
-- Adds Arabic (ar) columns alongside existing Hindi (hi) columns
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add Arabic columns to restaurants
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS name_ar TEXT,
  ADD COLUMN IF NOT EXISTS address_ar TEXT;

-- Add Arabic columns to menu_categories
ALTER TABLE menu_categories
  ADD COLUMN IF NOT EXISTS name_ar TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- Add Arabic columns to menu_items
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS name_ar TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- Update currency default to AED for new restaurants
ALTER TABLE restaurants
  ALTER COLUMN currency SET DEFAULT 'AED';

-- Update monthly fee default to AED 199
ALTER TABLE restaurants
  ALTER COLUMN monthly_fee_inr SET DEFAULT 199;

-- Update default language to support 'ar'
-- (column already TEXT, 'en' | 'ar' now valid values)

-- ============================================================
-- DEMO RESTAURANT FOR UAE (optional, run after signup)
-- Replace YOUR_USER_UUID with your Supabase auth user ID
-- ============================================================

/*
INSERT INTO restaurants (
  owner_user_id, name_en, name_ar, slug, whatsapp_number,
  cuisine_type, area, currency, gst_percentage, gst_type
) VALUES (
  'YOUR_USER_UUID',
  'Shawarma Palace',
  'شاورما بالاس',
  'shawarma-palace',
  '+971501234567',
  'Arabic',
  'JBR',
  'AED',
  5,
  'exclusive'
);
*/
