import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS, server-only
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, restaurantName, whatsapp } = await req.json()

    if (!email || !password || !restaurantName || !whatsapp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Create the auth user via Admin API (auto-confirms email)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm so they can log in immediately
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Auth signup failed' }, { status: 400 })
    }

    // 2. Insert restaurant row using service role (bypasses RLS)
    function slugify(name: string) {
      return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
    const slug = slugify(restaurantName) + '-' + Math.random().toString(36).slice(2, 6)

    const { error: restError } = await supabase.from('restaurants').insert({
      owner_user_id: authData.user.id,
      name_en: restaurantName,
      slug,
      whatsapp_number: whatsapp.startsWith('+') ? whatsapp : `+91${whatsapp}`,
      currency: 'INR',
      gst_percentage: 5,
      gst_type: 'exclusive',
    })

    if (restError) {
      // Rollback: delete the created user if restaurant insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: restError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: authData.user.id })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
