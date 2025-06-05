import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { generateOTP, hashOTP } from "@/lib/otp"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, email_verified')
      .eq('email', email)
      .single()

    if (profileError) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    if (profile.email_verified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 }
      )
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpHash = hashOTP(otp, email)

    // Delete any existing OTPs for this email
    await supabase
      .from('email_verification_otps')
      .delete()
      .eq('email', email)

    // Store new OTP
    const { error: insertError } = await supabase
      .from('email_verification_otps')
      .insert([
        {
          email,
          otp_hash: otpHash,
          created_at: new Date().toISOString()
        }
      ])

    if (insertError) {
      console.error('Error storing OTP:', insertError)
      return NextResponse.json(
        { message: "Failed to generate verification code" },
        { status: 500 }
      )
    }

    // Send email
    const { success, error } = await sendVerificationEmail(
      email,
      profile.first_name,
      otp
    )

    if (!success) {
      console.error('Error sending email:', error)
      return NextResponse.json(
        { message: "Failed to send verification email" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Verification code sent successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error resending OTP:', error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 