import { Types } from "mongoose";
export interface ApiResponse<T>{
    success?:boolean;
    message?:string;
    data?:T;
    error?:string | object
}

export const successResponse=<T>(message?:string,data?:T):ApiResponse<T>=>(
    {
        success:true,
        message,
        data
    }
)

export const errorResponse=(message?:string,error?:string | object):ApiResponse<never>=>({
    success:false,
    message,
    error
})


export interface ISlotDTO {
  doctorId: Types.ObjectId | string;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isAvailable: boolean;
}


export interface ICreateAppointmentDTO {
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    slotId: Types.ObjectId;
    appointmentId?:string;
    date: Date;
    startTime: string;
    endTime: string;
    status: "booked" | "cancelled" | "pending"; 
    paymentStatus: "paid" | "unpaid";
    amount: number;
  }

  export interface ProfitData{
    labels:string[];
    data:number[];
    total:number;
  }
  
  

