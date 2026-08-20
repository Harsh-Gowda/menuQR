import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * POST /api/admin/set-developer
 * Body: { secret: string, email: string }
 *
 * Marks a restaurant owner account as a permanent developer account.
 * Developer accounts never need to pay — they always have full access.
 *
 * Protect with ADMIN_SECRET env variable.
 */
export async function POST(req: NextRequest) {
  try {
    const { secret, email } = await req.json()

    const adminSecret = process.env.ADMIN_SECRET
    if (!adminSecret || secret !== adminSecret) {
      // Return 404, not 401, to avoid revealing the endpoint exists
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Look up auth user by email
    const { data: usersData, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) {
      return NextResponse.json({ error: 'Could not list users' }, { status: 500 })
    }

    const user = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!user) {
      return NextResponse.json({ error: 'No user found with that email' }, { status: 404 })
    }

    // Update their restaurant row
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        is_developer_account: true,
        plan: 'developer',
        subscription_active: true,
        subscription_ends_at: null, // never expires
        trial_ends_at: null,
      })
      .eq('owner_user_id', user.id)
      .select('id, name_en, slug')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Developer access granted to ${email}`,
      restaurant: data?.[0] ?? null,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
