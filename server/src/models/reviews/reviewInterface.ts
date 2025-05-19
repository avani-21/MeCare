import mongoose, { Document, Types } from "mongoose";

export interface IReview {
    _id?:Types.ObjectId;
    doctorId:Types.ObjectId | string;
    patientId:Types.ObjectId | string;
    appointmentId: Types.ObjectId | string;
    ratings:number;
    comment?:string;
    createdAt?:Date;
    updatedAt?:Date;
}