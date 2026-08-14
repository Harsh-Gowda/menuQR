import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    const {
      restaurantId,
      tableNumber,
      customerName,
      orderType,
      orderItems,
      orderSummary,
      subtotal,
      taxAmount,
      total,
      notes,
      source,
      language,
    } = body

    if (!restaurantId || !orderItems || !orderSummary) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        table_number: tableNumber || null,
        customer_name: customerName || null,
        order_type: orderType || 'dine_in',
        order_items: orderItems,
        order_summary: orderSummary,
        subtotal: subtotal || 0,
        tax_amount: taxAmount || 0,
        total_amount: total || 0,
        status: 'new',
        notes: notes || null,
        source: source || 'qr',
        language: language || 'en',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Order insert error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Also bump stats counter
    await supabase.rpc('increment_order_count', { rid: restaurantId })

    return NextResponse.json({ success: true, orderId: data.id })
  } catch (err) {
    console.error('Place order error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
