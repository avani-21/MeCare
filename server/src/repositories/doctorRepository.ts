import { injectable } from "inversify";
import DoctorModel from "../models/doctor/doctorModel";
import { IDoctor } from "../models/doctor/doctorInterface";
import {IDoctorRepo} from "../interfaces/doctor.repo"

@injectable()
export class DoctorRepository implements IDoctorRepo{
 

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

async getApprovedDoctors(page: number=1, limit: number=3, filters: {
   specialization?: string;
   gender?: string;
   experience?: number;
 }): Promise<{ doctors: IDoctor[]; total: number; }> {
   const skip = (page - 1) * limit;
   const query: any = {};

   if (filters.specialization) {
      query.specialization = { 
        $regex: filters.specialization, 
        $options: 'i' 
      };
    }
  
    if (filters.gender) {
      query.gender = filters.gender; // Exact match for gender
    }
  
    if (filters.experience) {
      query.experience = { $gte: filters.experience }; // Doctors with >= given experience
    }
 
   const [doctors, total] = await Promise.all([
      DoctorModel.find(query).skip(skip).limit(limit).lean(),
      DoctorModel.countDocuments(query)
    ]);
    return { doctors, total };
} 

async getAllDoctors(): Promise<number> {
  return await DoctorModel.find({isApproved:true}).countDocuments()
}
   
}