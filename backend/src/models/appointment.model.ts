import { aggregatePaginate, paginate } from '../utils/mongoose';
import { Schema, model, Document } from 'mongoose';

export interface IAppointment extends Document {
  user: Schema.Types.ObjectId;
  attorney: Schema.Types.ObjectId;
  select_date: string;
  slot_time: string;
  case_type: string;
  short_description: string;
  case_history?: string;
  evidence?: string[];
  payment?: {
    method: string;
    status: string;
    amount: number;
    transaction_id?: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
  meetLink: string;
  createdAt: Date;
  updatedAt: Date;
  slotAvailable: boolean;
}

const appointmentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  attorney: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  select_date: {
    type: Date,
    required: true
  },
  slot_time: {
    type: String,
    required: true
  },
  case_type: {
    type: String,
    required: true
  },
  short_description: {
    type: String,
    required: true
  },
  file_name: { type: String},
  file: { type: String, default: '' },
  case_history: { type: String, default: '' },
  evidence: { type: [String], default: [] },
  status: {
    type: String,
    enum: ['pending', 'confirmed','completed'],
    default: 'pending'
  },
  meetLink: String,
  payment:{
    method: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
  },
    amount: { type: Number, default: 0 },
    transaction_id: { type: String, default: '' }
  }
}, {
  timestamps: true
});

appointmentSchema.plugin(paginate);
appointmentSchema.plugin(aggregatePaginate);

export const Appointment = model<IAppointment>('Appointment', appointmentSchema);