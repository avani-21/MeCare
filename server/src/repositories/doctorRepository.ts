import { injectable } from "inversify";
import DoctorModel from "../models/doctor/doctorModel";
import { IDoctor } from "../models/doctor/doctorInterface";
import {IDoctorRepo} from "../interfaces/doctor.repo"

@injectable()
export class DoctorRepository implements IDoctorRepo{
   async getApprovedDoctors():Promise<IDoctor[]| null>{
    return await DoctorModel.find({isApproved:true})
   }   

   async findDoctor(email: string): Promise<IDoctor | null> {
      return await DoctorModel.findOne({email})
   }

   async updateOtp(email:string,otp:string,otpExpiration:Date):Promise<void>{
    await DoctorModel.findOneAndUpdate({email},{otp,otpExpiration},{new:true})
   }

   async verifyDoctor(email:string):Promise<void>{
    await DoctorModel.findOneAndUpdate({email},{isVerified:true,otp:null,otpExpiration:null},{new:true})
   }

  async updateDoctor(doctorId: string, updateData: Partial<IDoctor>): Promise<IDoctor | null> {
     return await DoctorModel.findByIdAndUpdate(doctorId,updateData,{new:true})
  }

  async getDoctorById(id: string): Promise<IDoctor | null> {
     return await DoctorModel.findById(id)
  }

   
}