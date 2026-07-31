export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Restaurant {
  id: string
  owner_user_id: string
  name_en: string
  name_hi: string | null
  slug: string
  logo_url: string | null
  cover_image_url: string | null
  cuisine_type: string | null
  whatsapp_number: string
  phone: string | null
  address_en: string | null
  address_hi: string | null
  area: string | null
  google_maps_url: string | null
  currency: string
  gst_percentage: number
  gst_type: 'inclusive' | 'exclusive'
  show_gst: boolean
  is_veg_only: boolean
  default_language: 'en' | 'hi'
  accept_orders: boolean
  operating_hours: Json | null
  plan: 'trial' | 'basic' | 'pro'
  trial_ends_at: string
  subscription_active: boolean
  total_menu_views: number
  total_whatsapp_orders: number
  monthly_fee_inr: number
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: string
  restaurant_id: string
  name_en: string
  name_hi: string | null
  description_en: string | null
  description_hi: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  available_from: string | null
  available_until: string | null
  created_at: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string
  name_en: string
  name_hi: string | null
  description_en: string | null
  description_hi: string | null
  price: number
  original_price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  is_spicy: boolean
  is_veg: boolean
  is_jain: boolean
  is_new: boolean
  allergens: string[] | null
  customisation_groups: CustomisationGroup[]
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CustomisationGroup {
  name: string
  name_hi?: string
  required?: boolean
  options: CustomisationOption[]
}

export interface CustomisationOption {
  label: string
  label_hi?: string
  price_add: number
}

export interface RestaurantTable {
  id: string
  restaurant_id: string
  table_number: string
  table_label_en: string | null
  section: string | null
  seats: number | null
  qr_code_url: string | null
  is_active: boolean
  created_at: string
}

export interface OrderLog {
  id: string
  restaurant_id: string
  table_number: string | null
  order_type: 'dine_in' | 'takeaway' | 'delivery'
  order_summary: string
  order_items: Json
  subtotal: number | null
  gst_amount: number | null
  total_amount: number | null
  customer_name: string | null
  customer_phone: string | null
  source: 'qr' | 'link' | 'direct'
  language: 'en' | 'hi'
  created_at: string
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  selectedOptions: { [groupName: string]: CustomisationOption }
  notes: string
  totalPrice: number
}

export type Language = 'en' | 'hi'
export type OrderType = 'dine_in' | 'takeaway' | 'delivery'
