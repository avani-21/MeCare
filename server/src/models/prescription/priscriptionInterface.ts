
import { Types } from 'mongoose';

interface IMedication{
  name:string,
  frequency:string,
  dosage:string,
  duration:string
}

export interface IPrescription {
  _id?: Types.ObjectId | string;
  appointmentId: Types.ObjectId | string;
  doctorId: Types.ObjectId | string;
  patientId: Types.ObjectId | string;
  diagnosis: string;
  medications: IMedication[];
  instructions: string;
  createdAt?: Date;
  updatedAt?: Date;
}