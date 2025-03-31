import mongoose,{Schema, trusted} from "mongoose";
import { IDoctor } from "./doctorInterface";

const doctorSchema=new Schema<IDoctor>(
    {
      specialization: { type: String, required: true },
      fullName: { type: String, required: true },
      education: { type: String, required: true },
      gender: { type: String, required: true },
      experience: { type: Number, required: true },
      consultantFee: { type: Number, required: true },
      profileImg: { type: String, required: true },
      phone: { type: String, required: true },
      about: { type: String, required: true },
      kycCertificate: { type: String, required: true },
      availableDays: { type: [String], required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      isVerified: { type: Boolean, default: false },
      isApproved: { type: Boolean, default: true },
      reviewCount: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      rating: { type: Number, default: 0 },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }, 
      otp:{type:String},
      otpExpiration:{type:Date} 
    },
    {timestamps:true}
)

export default doctorSchema;