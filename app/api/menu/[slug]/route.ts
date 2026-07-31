import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch restaurant
  const { data: restaurant, error: restErr } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (restErr || !restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Fetch items
  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order', { ascending: true })

  return NextResponse.json(
    { restaurant, categories: categories || [], items: items || [] },
    {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      },
    }
  )
}
