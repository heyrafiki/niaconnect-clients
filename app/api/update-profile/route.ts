import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/client';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest) {
  await dbConnect();
  const token = await getToken({ req });
  if (!token || !token.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const email = token.email;
  const data = await req.json();
  try {
    const update: any = {};
    if (data.firstName) update.first_name = data.firstName;
    if (data.lastName) update.last_name = data.lastName;
    if (data.avatar) update.profile_img_url = data.avatar;
    if (data.phone) update['onboarding.phone_number'] = data.phone;
    if (data.sessionTypes) update['onboarding.session_types'] = data.sessionTypes;
    if (data.preferredTimes) update['onboarding.preferred_times'] = data.preferredTimes;
    // Password change
    if (data.password) {
      if (data.password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      update.password_hash = await bcrypt.hash(data.password, 10);
    }
    const updated = await Client.findOneAndUpdate(
      { email },
      { $set: update },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const token = await getToken({ req });
  if (!token || !token.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const email = token.email;
  try {
    const deleted = await Client.findOneAndDelete({ email });
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
