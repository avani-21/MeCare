import mongoose,{Document} from "mongoose";

  export interface IDoctor extends Document {
    _id: string; 
    fullName: string;
    specialization: string;
    education: string;
    gender: string;
    experience: number; 
    consultantFee: number;
    profileImg: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    about: string;
    kycCertificate: string;
    availableDays: string[];
    email: string;
    password: string;
    isVerified: boolean;
    isApproved: boolean;
    reviewCount: number;
    createdAt: Date;
    rating: number;
    otp?:string;
    otpExpiration?:string;
    absentDays?:Date[];
    startHour?: number;    
    endHour?: number;      
    slotDuration?: number; 
  }
 