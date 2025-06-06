import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/client';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    await dbConnect();
    const user = await Client.findOne({ email, provider: 'email' });
    if (!user) {
      return NextResponse.json({ error: 'No user found with this email.' }, { status: 404 });
    }
    if (!user.is_verified) {
      return NextResponse.json({ error: 'Email not verified. Please verify your email via OTP.' }, { status: 401 });
    }
    if (!user.password_hash) {
      return NextResponse.json({ error: 'No password set for this account.' }, { status: 400 });
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
    }
    // If onboarding not complete, frontend should redirect to onboarding
    return NextResponse.json({ success: true, user: { email: user.email, id: user._id, is_verified: user.is_verified, onboarding: user.onboarding, first_name: user.first_name, last_name: user.last_name } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signin failed.' }, { status: 500 });
  }
}
