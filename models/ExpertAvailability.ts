import mongoose, { Document, Schema } from 'mongoose';

export interface IExpertAvailability extends Document {
  expert_id: mongoose.Types.ObjectId;
  day_of_week?: number;
  time_slots: { start_time: string; end_time: string }[];
  is_recurring: boolean;
  date?: Date;
  timezone: string;
  created_at: Date;
  updated_at: Date;
}

const TimeSlotSchema = new Schema(
  {
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
  },
  { _id: false }
);

const ExpertAvailabilitySchema = new Schema<IExpertAvailability>({
  expert_id: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
  day_of_week: { type: Number, min: 0, max: 6 },
  time_slots: { type: [TimeSlotSchema], required: true },
  is_recurring: { type: Boolean, default: true },
  date: { type: Date },
  timezone: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.ExpertAvailability ||
  mongoose.model<IExpertAvailability>('ExpertAvailability', ExpertAvailabilitySchema); 