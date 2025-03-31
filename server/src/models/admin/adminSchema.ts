import mongoose, { Schema } from "mongoose";
import { IAdmin } from "./adminInterface";

const adminSchema=new Schema<IAdmin>(
    {
        email:{
          type:String,
          required:true,
          unique:true
        },
        password:{
            type:String,
            required:true
        }
    },
    {timestamps:true}
)

export default adminSchema