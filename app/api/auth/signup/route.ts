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
    const { userId, email, firstName, lastName } = await request.json()

    // Log the incoming request data
    console.log('Received signup request:', { userId, email, firstName, lastName })

    // First check if profile already exists
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
      // If profile exists, we can consider this a success since the end goal is achieved
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
        is_onboarded: false
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