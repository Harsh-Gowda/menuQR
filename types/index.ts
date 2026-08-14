export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Restaurant {
  id: string
  owner_user_id: string
  name_en: string
  name_ar: string | null   // Arabic name (UAE)
  name_hi: string | null   // Hindi name (legacy)
  slug: string
  logo_url: string | null
  cover_image_url: string | null
  cuisine_type: string | null
  whatsapp_number: string
  phone: string | null
  address_en: string | null
  address_ar: string | null
  address_hi: string | null
  area: string | null
  google_maps_url: string | null
  currency: string          // 'AED' for UAE
  gst_percentage: number    // treated as VAT percentage (5% for UAE)
  gst_type: 'inclusive' | 'exclusive'
  show_gst: boolean
  is_veg_only: boolean
  default_language: 'en' | 'ar' | 'hi'
  accept_orders: boolean
  operating_hours: Json | null
  plan: 'trial' | 'basic' | 'pro'
  trial_ends_at: string
  subscription_active: boolean
  total_menu_views: number
  total_whatsapp_orders: number
  monthly_fee_inr: number   // used as AED fee for UAE
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: string
  restaurant_id: string
  name_en: string
  name_ar: string | null   // Arabic name
  name_hi: string | null   // Hindi name (legacy)
  description_en: string | null
  description_ar: string | null
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
  name_ar: string | null   // Arabic name
  name_hi: string | null   // Hindi name (legacy)
  description_en: string | null
  description_ar: string | null
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
  name_ar?: string
  name_hi?: string
  required?: boolean
  options: CustomisationOption[]
}

export interface CustomisationOption {
  label: string
  label_ar?: string
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
  gst_amount: number | null  // used as vat_amount for UAE
  total_amount: number | null
  customer_name: string | null
  customer_phone: string | null
  source: 'qr' | 'link' | 'direct'
  language: 'en' | 'ar' | 'hi'
  created_at: string
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  selectedOptions: { [groupName: string]: CustomisationOption }
  notes: string
  totalPrice: number
}

export type Language = 'en' | 'ar' | 'hi'
export type OrderType = 'dine_in' | 'takeaway' | 'delivery'
export type OrderStatus = 'new' | 'preparing' | 'ready' | 'done'

export interface Order {
  id: string
  restaurant_id: string
  table_number: string | null
  customer_name: string | null
  order_type: OrderType
  order_items: Json
  order_summary: string
  subtotal: number
  tax_amount: number
  total_amount: number
  status: OrderStatus
  notes: string | null
  source: string
  language: string
  created_at: string
  updated_at: string
}
