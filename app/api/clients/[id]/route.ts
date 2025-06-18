import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// Minimal Client schema for cross-app fetch (ensure it matches the full Client model if more fields are needed)
const ClientSchema = new mongoose.Schema({
  email: String,
  first_name: String,
  last_name: String,
  provider: String,
  is_verified: Boolean,
  onboarding: {
    completed: Boolean,
    phone_number: String,
    gender: String,
    date_of_birth: String,
    location: String,
    profile_img_url: String,
    // Add more fields as needed
  },
  created_at: Date,
  updated_at: Date,
}, { collection: 'clients' });
const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;

  try {
    const client = await Client.findById(id).lean();
    if (!client) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    }
    return NextResponse.json({ client });
  } catch (error) {
    console.error('Failed to fetch client:', error);
    return NextResponse.json({ error: 'Failed to fetch client.' }, { status: 500 });
  }
}
