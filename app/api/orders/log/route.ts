import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = await createClient()

  const { error } = await supabase.from('order_logs').insert({
    restaurant_id: body.restaurantId,
    table_number: body.tableNumber || null,
    order_type: body.orderType || 'dine_in',
    order_summary: body.orderSummary,
    order_items: body.orderItems,
    subtotal: body.subtotal,
    gst_amount: body.gstAmount,
    total_amount: body.total,
    customer_name: body.customerName || null,
    source: body.source || 'qr',
    language: body.language || 'en',
  })

  // Also bump the counter
  if (!error) {
    await supabase.rpc('increment_order_count', { rid: body.restaurantId })
  }

  return NextResponse.json({ success: !error, error: error?.message })
}
