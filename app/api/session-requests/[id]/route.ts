import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SessionRequest from '@/models/SessionRequest';
import { getToken } from 'next-auth/jwt';
import mongoose from 'mongoose';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized: Client not authenticated.' }, { status: 401 });
    }

    const { id } = params;
    const updates = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Session Request ID.' }, { status: 400 });
    }

    const sessionRequest = await SessionRequest.findOneAndUpdate(
      { _id: id, client_id: new mongoose.Types.ObjectId(token.id as string) },
      { $set: updates },
      { new: true }
    );

    if (!sessionRequest) {
      return NextResponse.json({ error: 'Session request not found or not authorized.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Session request updated successfully.', sessionRequest });

  } catch (error: any) {
    console.error('Error updating session request:', error);
    return NextResponse.json({ error: 'Failed to update session request.', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized: Client not authenticated.' }, { status: 401 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Session Request ID.' }, { status: 400 });
    }

    const sessionRequest = await SessionRequest.findOneAndDelete(
      { _id: id, client_id: new mongoose.Types.ObjectId(token.id as string) },
    );

    if (!sessionRequest) {
      return NextResponse.json({ error: 'Session request not found or not authorized.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Session request deleted successfully.' });

  } catch (error: any) {
    console.error('Error deleting session request:', error);
    return NextResponse.json({ error: 'Failed to delete session request.', details: error.message }, { status: 500 });
  }
} 