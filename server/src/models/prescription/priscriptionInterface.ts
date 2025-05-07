
import { Types } from 'mongoose';

export interface IPrescription {
  _id?: Types.ObjectId | string;
  appointmentId: Types.ObjectId | string;
  doctorId: Types.ObjectId | string;
  patientId: Types.ObjectId | string;
  diagnosis: string;
  medications: string[] | string;
  instructions: string;
  createdAt?: Date;
  updatedAt?: Date;
}