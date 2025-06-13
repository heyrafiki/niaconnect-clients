import mongoose, { Document, Schema } from 'mongoose';

export interface ISessionRequest extends Document {
  client_id: mongoose.Types.ObjectId;
  expert_id: mongoose.Types.ObjectId;
  requested_time: Date;
  session_type: string;
  reason?: string;
  status: 'pending' | 'accepted' | 'declined' | 'rescheduled';
  proposed_alternatives?: Date[];
  created_at: Date;
  updated_at: Date;
}

const SessionRequestSchema = new Schema<ISessionRequest>({
  client_id: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  expert_id: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
  requested_time: { type: Date, required: true },
  session_type: { type: String, required: true },
  reason: { type: String },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'rescheduled'],
    required: true,
    default: 'pending',
  },
  proposed_alternatives: [{ type: Date }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.SessionRequest ||
  mongoose.model<ISessionRequest>('SessionRequest', SessionRequestSchema);
