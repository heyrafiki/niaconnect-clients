import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyOTP, isOTPExpired } from "@/lib/otp"

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      )
    }

    // Get stored OTP data from Supabase
    const { data: otpData, error: otpError } = await supabase
      .from('email_verification_otps')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpData) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    if (isOTPExpired(new Date(otpData.created_at))) {
      return NextResponse.json(
        { message: "Verification code has expired" },
        { status: 400 }
      )
    }

    // Verify OTP
    const isValid = verifyOTP(otpData.otp_hash, otp, email)
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Mark email as verified in profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ email_verified: true })
      .eq('email', email)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json(
        { message: "Failed to verify email" },
        { status: 500 }
      )
    }

    // Delete used OTP
    await supabase
      .from('email_verification_otps')
      .delete()
      .eq('email', email)

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 