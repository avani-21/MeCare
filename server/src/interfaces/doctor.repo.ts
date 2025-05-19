import { IDoctor } from "../models/doctor/doctorInterface";

export interface IDoctorRepo{
   
    findDoctor(email:string):Promise<IDoctor | null>
    updateOtp(email:string,otp:string,otpExpiration:Date):Promise<void>
    verifyDoctor(email: string): Promise<void>;
    getDoctorById(id:string):Promise<IDoctor | null>
    updateDoctor(doctorId:string,updateData:Partial<IDoctor>):Promise<IDoctor | null>
    getApprovedDoctors(
        page: number,
        limit: number,
        filters?: {
          specialization?: string;
          gender?: string;
          experience?: number;
            searchQuery?: string;
        }
      ): Promise<{ doctors: IDoctor[]; total: number }>;
      
      getAllDoctors():Promise<number>
}