import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Missing orderId or status' }, { status: 400 })
    }

    const validStatuses = ['new', 'preparing', 'ready', 'done']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify ownership via RLS — only owner can update
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      console.error('Order status update error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Status update error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
