import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  email: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  is_verified: boolean;
  provider: 'email' | 'google';
  created_at: Date;
  updated_at: Date;
  onboarding?: {
    completed: boolean;
    phone_number?: string;
    gender?: string;
    date_of_birth?: string;
    location?: string;
    profile_img_url?: string;
    therapy_reasons?: string[];
    session_types?: string[];
    preferred_times?: string[];
    mental_health_scale?: number;
  };
  otp?: string;
  otp_expiry?: Date;
  profile_img_url?: string;
  reset_otp: string;
  reset_otp_expiry: Date;
}

const ClientSchema = new Schema<IClient>({
  email: { type: String, required: true, unique: true, index: true },
  password_hash: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  is_verified: { type: Boolean, required: true, default: false },
  provider: { type: String, enum: ['email', 'google'], required: true },
  otp: { type: String },
  otp_expiry: { type: Date },
  profile_img_url: { type: String },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
  onboarding: {
    type: {
      completed: { type: Boolean, default: false },
      phone_number: { type: String },
      gender: { type: String },
      date_of_birth: { type: String },
      location: { type: String },
      profile_img_url: { type: String },
      therapy_reasons: [{ type: String }],
      session_types: [{ type: String }],
      preferred_times: [{ type: String }],
      mental_health_scale: { type: Number }
    },
    default: {}
  },
  reset_otp: { type: String },
  reset_otp_expiry: { type: Date },
});

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);