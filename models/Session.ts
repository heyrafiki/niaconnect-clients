import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  client_id: mongoose.Types.ObjectId;
  expert_id: mongoose.Types.ObjectId;
  session_type: string;
  reason?: string;
  notes?: string;
  tasks?: {
    title: string;
    description: string;
    status: 'pending' | 'completed';
  }[];
  start_time: Date;
  end_time: Date;
  meeting_url?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: {
    rating?: number;
    comment?: string;
  };
  created_at: Date;
  updated_at: Date;
}

const SessionSchema = new Schema<ISession>({
  client_id: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  expert_id: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
  session_type: { type: String, required: true },
  reason: { type: String },
  notes: { type: String },
  tasks: [{
    title: { type: String },
    description: { type: String },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
  }],
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  meeting_url: { type: String },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    required: true,
    default: 'scheduled',
  },
  feedback: {
    rating: { type: Number },
    comment: { type: String },
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.Session ||
  mongoose.model<ISession>('Session', SessionSchema);
