import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/client';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }
    await dbConnect();
    const user = await Client.findOne({ email, provider: 'email' });
    if (!user) {
      return NextResponse.json({ error: 'No user found with this email.' }, { status: 404 });
    }
    if (user.is_verified) {
      return NextResponse.json({ error: 'Email already verified.' }, { status: 409 });
    }
    if (!user.otp || !user.otp_expiry || user.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP.' }, { status: 401 });
    }
    if (user.otp_expiry < new Date()) {
      return NextResponse.json({ error: 'OTP has expired.' }, { status: 410 });
    }
    user.is_verified = true;
    user.otp = undefined;
    user.otp_expiry = undefined;
    await user.save();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'OTP verification failed.' }, { status: 500 });
  }
}
