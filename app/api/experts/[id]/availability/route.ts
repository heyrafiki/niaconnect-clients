import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExpertAvailability from '@/models/ExpertAvailability';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;

  try {
    // Find availability slots for the given expert ID
    const availability = await ExpertAvailability.find({ expert_id: id }).lean();

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Failed to fetch expert availability:', error);
    return NextResponse.json({ error: 'Failed to fetch expert availability.' }, { status: 500 });
  }
} 