import mongoose, { Schema } from "mongoose";
import { IPatient } from "./patientInterface";

const patientSchema=new Schema<IPatient>(
    {
        name:{
            type:String,
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        },
        otp:{
            type:String,
        },
        otpExpiration:{
           type:Date
        },
        isVerified:{
            type:Boolean,
            default:false
        },
        googleId:{
            type:String,
        },
        gender:{
            type:String,
            enum:["Male","Female","Other"],
            default:null,
        },
        phone:{
            type:String,
            default:null
        },
        city:{
            type:String
        },
        street:{
            type:String
        },
        pincode:{
            type:String
        },
        dob:{
            type:Date
        },
        age:{
            type:Number
        },
        profileImage:{
            type:String,
            default:"https://res.cloudinary.com/danyvuvkm/image/upload/v1742640347/vecteezy_default-profile-account-unknown-icon-black-silhouette_20765399_cdpbr4.jpg"
        }
    },
    {timestamps:true}
)

export default patientSchema;