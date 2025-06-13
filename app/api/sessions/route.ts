import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const client_id = searchParams.get('client_id');
  if (!client_id) return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });
  const sessions = await Session.find({ client_id })
    .populate('expert_id', 'first_name last_name profile_img_url')
    .sort({ start_time: -1 })
    .lean();
  return NextResponse.json({ sessions });
} 