import { Schema, model, Types } from 'mongoose';

export type ReportStatus = 'Submitted' | 'In Progress' | 'Resolved';

export interface IReport {
  citizen: Types.ObjectId;
  description: string;
  photoUrl: string;
  afterPhotoUrl?: string;
  location: { type: 'Point'; coordinates: [number, number]; address?: string };
  status: ReportStatus;
  concernCount: number;
  confirmedBy: Types.ObjectId[];
}

const reportSchema = new Schema<IReport>({
  citizen: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  description: { type: String, required: true, maxlength: 500 },
  photoUrl: { type: String, required: true },
  afterPhotoUrl: { type: String },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true, index: '2dsphere' },
    address: { type: String }
  },
  status: { type: String, enum: ['Submitted', 'In Progress', 'Resolved'], default: 'Submitted', index: true },
  concernCount: { type: Number, default: 0 },
  confirmedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default model<IReport>('Report', reportSchema);