import { Schema } from "mongoose";
import { ISlot } from "./slotInterface";

let SlotSchema=new Schema<ISlot>(
    {
       doctorId:{
        type:Schema.Types.ObjectId,
        ref:"Doctor",
        required:true,

       } ,
       date:{
        type:Date,
        required:true
       },
       startTime:{
        type:String,
        required:true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/ 
       },
       endTime:{
         type:String,
         required:true,
         match: /^([01]\d|2[0-3]):([0-5]\d)$/ 
       },
       isBooked:{
        type:Boolean,
        default:false
       },
       isAvailable:{
        type:Boolean,
        default:true
       }
    },
    {timestamps:true}
)

export default SlotSchema