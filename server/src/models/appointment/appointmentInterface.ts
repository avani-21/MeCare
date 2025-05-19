import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { IDoctor } from '../doctor/doctorInterface';
import { IReview } from '../reviews/reviewInterface';
import { IPrescription } from '../prescription/priscriptionInterface';

export interface IAppointment extends Document {
    patientId: mongoose.Types.ObjectId;
    reviewId: mongoose.Types.ObjectId | IReview;
    prescriptionId: mongoose.Types.ObjectId | IPrescription;
    doctorId: mongoose.Types.ObjectId | IDoctor;
    slotId: mongoose.Types.ObjectId;
    appointmentId?:string;
    date: Date;
    startTime: string;
    endTime: string;
    status: 'booked' | 'completed' | 'cancelled' | 'pending';
    paymentStatus: 'paid' | 'unpaid';
    amount: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
