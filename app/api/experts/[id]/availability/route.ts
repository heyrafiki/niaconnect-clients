import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// Schema for AvailabilitySlot (ensure it matches your actual AvailabilitySlot model)
const AvailabilitySlotSchema = new mongoose.Schema({
  expert_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
  day_of_week: { type: Number, min: 0, max: 6 }, // 0 for Sunday, 6 for Saturday
  time_slots: [{
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
  }],
  is_recurring: { type: Boolean, default: true },
  date: { type: Date }, // For non-recurring slots
  timezone: { type: String, required: true },
}, { collection: 'availabilitySlots' }); // Assuming your collection is named 'availabilitySlots'

const AvailabilitySlot = mongoose.models.AvailabilitySlot || mongoose.model('AvailabilitySlot', AvailabilitySlotSchema);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = await params; // Await params to avoid the Next.js warning

  try {
    // Find availability slots for the given expert ID
    const availability = await AvailabilitySlot.find({ expert_id: id }).lean();

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Failed to fetch expert availability:', error);
    return NextResponse.json({ error: 'Failed to fetch expert availability.' }, { status: 500 });
  }
} 