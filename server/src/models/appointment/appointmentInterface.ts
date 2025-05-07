import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { IDoctor } from '../doctor/doctorInterface';

export interface IAppointment extends Document {
    patientId: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId | IDoctor;
    slotId: mongoose.Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    status: 'booked' | 'completed' | 'cancelled' | 'pending';
    paymentStatus: 'paid' | 'unpaid';
    amount: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
