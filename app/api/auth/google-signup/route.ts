import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: Request) {
  try {
    let { userId, email, firstName, lastName } = await request.json()
    console.log('Received Google signup request:', { userId, email, firstName, lastName })

    // Wait for user to exist in auth.users (max 2 seconds, check every 200ms)
    let userRecord = null
    for (let i = 0; i < 10; i++) {
      const { data, error } = await supabaseAdmin.rpc('get_user_by_id', { user_id: userId })
      if (error) {
        console.error('Error fetching user from auth.users:', error)
      }
      if (data && data.length > 0) {
        userRecord = data[0]
        break
      }
      await new Promise(res => setTimeout(res, 200))
    }
    if (!userRecord) {
      console.error('User not found in auth.users after waiting')
      return NextResponse.json({ error: 'User not found in auth.users' }, { status: 500 })
    }

    // If any field is missing, extract from user metadata
    if (!email || !firstName || !lastName) {
      const meta = userRecord.raw_user_meta_data || {}
      email = email || userRecord.email
      firstName = firstName || meta.first_name || meta.given_name || meta.name || ''
      lastName = lastName || meta.last_name || meta.family_name || ''
    }
    if (!email || !firstName) {
      console.error('Missing required user fields for profile creation', { userId, email, firstName, lastName, meta: userRecord.raw_user_meta_data })
      return NextResponse.json({ error: 'Missing required user fields for profile creation' }, { status: 400 })
    }

    // Check for existing profile
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    if (checkError) {
      console.error('Error checking existing profile:', checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }
    if (existingProfile) {
      console.log('Profile already exists:', existingProfile)
      return NextResponse.json({ success: true, message: 'Profile already exists' })
    }

    // Create profile using admin client
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'client',
        is_onboarded: false,
        email_verified: true
      })
    if (insertError) {
      console.error('Profile creation failed:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }
    console.log('Profile created successfully for user:', userId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Profile creation failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}