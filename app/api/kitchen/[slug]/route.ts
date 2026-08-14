import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ slug: string }>
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Get restaurant by slug
    const { data: restaurant, error: restErr } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (restErr || !restaurant) {
      return NextResponse.json({ success: false, error: 'Restaurant not found' }, { status: 404 })
    }

    // Get active orders (not done) — last 4 hours to avoid stale
    const since = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .neq('status', 'done')
      .gte('created_at', since)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, orders: orders || [] })
  } catch (err) {
    console.error('Kitchen API error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
