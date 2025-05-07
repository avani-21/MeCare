import mongoose, { Schema } from "mongoose";
import { IPrescription } from "./priscriptionInterface";
 
const prescriptionSchema= new Schema<IPrescription>(
    {
        appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
        patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
        diagnosis: { type: String, required: true },
        medications: [{ type: String, required: true }],
        instructions: { type: String, required: true },
    },
    { timestamps: true }
)

export default prescriptionSchema;