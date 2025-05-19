import mongoose, { Schema } from "mongoose";
import { IPrescription } from "./priscriptionInterface";


const medicationSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    frequency:{
        type:String,
        required:true,
    },
    dosage:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    }
})
 
const prescriptionSchema= new Schema<IPrescription>(
    {
        appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
        patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
        diagnosis: { type: String, required: true },
        medications: [medicationSchema],
        instructions: { type: String, required: true },
    },
    { timestamps: true }
)

export default prescriptionSchema;