import { Schema } from "mongoose";
import { IAppointment } from "./appointmentInterface";
import mongoose from "mongoose";

const AppointmentSchema=new Schema<IAppointment>(
    {
        slotId:{
            type: mongoose.Schema.Types.ObjectId, 
            ref:"Slot",
            required:true,
        },
        appointmentId:{
         type:String,
        },
        doctorId:{
            type: mongoose.Schema.Types.ObjectId, 
            ref:"Doctor",
            required:true,
        },
        patientId:{
            type: mongoose.Schema.Types.ObjectId, 
            ref:"Patient",
            required:true
        },
        date:{
            type:Date,
            required:true
        },
        startTime:{
            type:String,
            required:true
        },
        endTime:{
            type:String,
            required:true
        },
        status: { 
            type: String, 
            enum: ['booked', 'completed', 'cancelled', "pending"],
            default: 'booked' 
          },
          paymentStatus:{
            type:String,
            enum:["paid","unpaid"],
            default:"unpaid"
          },
          amount:{
            type:Number,
            default:120
          },
         reviewId:{
            type: mongoose.Schema.Types.ObjectId, 
            ref:"Review",
        },
         prescriptionId:{
            type: mongoose.Schema.Types.ObjectId, 
            ref:"Prescription",
        },
    },
    {timestamps:true}
)

export default AppointmentSchema