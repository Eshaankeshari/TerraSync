import { Schema, model } from 'mongoose';

export type UserRole = 'citizen' | 'municipal';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'municipal'], default: 'citizen' }
}, { timestamps: true });

export default model<IUser>('User', userSchema);