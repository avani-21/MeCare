import mongoose, { Document } from "mongoose";

export interface IPatient extends Document{
    _id:string,
    name:string;
    email:string;
    password:string;
    isVerified?:boolean;
    googleId?:string;
    otp?:string;
    otpExpiration?:Date;
    phone?:string;
    street?:string;
    city?:string;
    gender?:"Male" | "Female" | "Other";
    pincode?:string;
    dob?:Date;
    age?:number;
    profileImage?:string
}