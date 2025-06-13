import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// Minimal Expert schema for cross-app fetch (ensure it matches the full Expert model if more fields are needed)
const ExpertSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  specialties: [String],
  profile_img_url: String,
  session_types: [String],
  location: String,
  bio: String,
  onboarding: {
    completed: Boolean,
    phone_number: String,
    gender: String,
    date_of_birth: String,
    location: String,
    profile_img_url: String,
    license_number: String,
    license_type: String,
    years_of_experience: String,
    specialties: [String],
    client_demographics: [String],
    treatment_modalities: [String],
    session_rate: String,
    session_types: [String],
    preferred_times: [String],
    bio: String,
  },
}, { collection: 'experts' });
const Expert = mongoose.models.Expert || mongoose.model('Expert', ExpertSchema);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = await params;

  try {
    const expert = await Expert.findById(id).lean();

    if (!expert) {
      return NextResponse.json({ error: 'Expert not found.' }, { status: 404 });
    }

    return NextResponse.json({ expert });
  } catch (error) {
    console.error('Failed to fetch expert:', error);
    return NextResponse.json({ error: 'Failed to fetch expert.' }, { status: 500 });
  }
} 