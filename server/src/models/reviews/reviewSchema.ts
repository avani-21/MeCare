import mongoose, { Schema } from "mongoose";
import { IReview } from "./reviewInterface";

const reviewSchema=new Schema<IReview>(
    {
        appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
        patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
        ratings: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true, maxlength: 500 },
    },
    {timestamps:true}
)

export default reviewSchema