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
  onboarding?: Record<string, any>;
  otp?: string;
  otp_expiry?: Date;
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
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
  onboarding: {
    type: {
      completed: { type: Boolean, default: false },
      // add other onboarding fields here if needed
    },
    default: {}
  },
});

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);