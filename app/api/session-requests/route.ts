import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SessionRequest from '@/models/SessionRequest';
import { getToken } from 'next-auth/jwt';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized: Client not authenticated.' }, { status: 401 });
    }

    const { expert_id, requested_time, session_type, reason } = await req.json();

    if (!expert_id || !requested_time || !session_type) {
      return NextResponse.json({ error: 'Missing required fields: expert_id, requested_time, session_type.' }, { status: 400 });
    }

    const newSessionRequest = await SessionRequest.create({
      client_id: new mongoose.Types.ObjectId(token.id as string),
      expert_id: new mongoose.Types.ObjectId(expert_id),
      requested_time: new Date(requested_time),
      session_type,
      reason,
      status: 'pending',
    });

    return NextResponse.json({ message: 'Session request submitted successfully.', sessionRequest: newSessionRequest }, { status: 201 });

  } catch (error: any) {
    console.error('Error submitting session request:', error);
    return NextResponse.json({ error: 'Failed to submit session request.', details: error.message }, { status: 500 });
  }
} 