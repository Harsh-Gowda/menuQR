import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = await createClient()

  await supabase.from('menu_views').insert({
    restaurant_id: body.restaurantId,
    table_number: body.tableNumber || null,
    source: body.source || 'qr',
    language: body.language || 'en',
  })

  await supabase.rpc('increment_view_count', { rid: body.restaurantId })

  return NextResponse.json({ success: true })
}
