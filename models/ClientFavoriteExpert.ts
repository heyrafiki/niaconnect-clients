import mongoose, { Document, Schema } from 'mongoose';

export interface IClientFavoriteExpert extends Document {
  client_id: mongoose.Types.ObjectId;
  expert_id: mongoose.Types.ObjectId;
  created_at: Date;
}

const ClientFavoriteExpertSchema = new Schema<IClientFavoriteExpert>({
  client_id: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  expert_id: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.ClientFavoriteExpert ||
  mongoose.model<IClientFavoriteExpert>('ClientFavoriteExpert', ClientFavoriteExpertSchema);