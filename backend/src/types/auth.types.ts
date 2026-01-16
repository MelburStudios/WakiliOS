import { Document, Types } from 'mongoose';

export type UserRole = 'user' | 'attorney' | 'admin';

export interface IAuthBase extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  otp?: string;
  otpExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
