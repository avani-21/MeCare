import { Document, Types } from "mongoose";

export interface ISlot extends Document {
  _id: string;
  doctorId: Types.ObjectId | string;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isAvailable: boolean;
  createdAt?: Date;  // Make optional with ?
  updatedAt?: Date;  // Make optional with ?
}