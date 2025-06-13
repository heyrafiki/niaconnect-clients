import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// Minimal Expert schema for cross-app fetch
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

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const specialization = searchParams.get('specialization');
  const location = searchParams.get('location');
  const search = searchParams.get('search');
  const sessionType = searchParams.get('sessionType');
  const clientDemographic = searchParams.get('clientDemographic');

  const filter: any = { 'onboarding.completed': true };
  if (specialization) filter['onboarding.specialties'] = specialization;
  if (location) filter['onboarding.location'] = location;
  if (sessionType) filter['onboarding.session_types'] = sessionType;
  if (clientDemographic) filter['onboarding.client_demographics'] = clientDemographic;

  if (search) {
    filter.$or = [
      { first_name: { $regex: search, $options: 'i' } },
      { last_name: { $regex: search, $options: 'i' } },
      { 'onboarding.bio': { $regex: search, $options: 'i' } }
    ];
  }
  const experts = await Expert.find(filter,
    '_id first_name last_name specialties profile_img_url session_types location bio onboarding'
  ).lean();
  return NextResponse.json({ experts });
}

export async function OPTIONS(req: NextRequest) {
  await dbConnect();
  const specializations = await Expert.distinct('onboarding.specialties', { 'onboarding.completed': true });
  const locations = await Expert.distinct('onboarding.location', { 'onboarding.completed': true });
  const sessionTypes = await Expert.distinct('onboarding.session_types', { 'onboarding.completed': true });
  const clientDemographics = await Expert.distinct('onboarding.client_demographics', { 'onboarding.completed': true });
  return NextResponse.json({ specializations, locations, sessionTypes, clientDemographics });
} 