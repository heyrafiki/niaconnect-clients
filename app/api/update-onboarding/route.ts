import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/client';

export async function POST(req: NextRequest) {
  await dbConnect();
  const token = await getToken({ req });
  console.log('[ONBOARDING] Token:', token);
  if (!token || !token.email) {
    console.warn('[ONBOARDING] Unauthorized: No token or email');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const email = token.email;
  const data = await req.json();
  console.log('[ONBOARDING] Email:', email);
  console.log('[ONBOARDING] Incoming data:', data);
  try {
    const update = { onboarding: { ...data, completed: true } };
    const updated = await Client.findOneAndUpdate(
      { email },
      { $set: update },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, onboarding: updated.onboarding });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update onboarding' }, { status: 500 });
  }
}
