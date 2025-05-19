import { IDoctor } from "../models/doctor/doctorInterface";
interface IVerification{
    message:string;
    id?:string
    refreshToken?:string;
    accessToken?:string;
}

export interface IDoctorService{

    sendOtp(email:string):Promise<string>;
    verifyOtp(email:string,otp:string):Promise<IVerification>;
    resendOtp(email:string):Promise<string>
    googleAuth(email:string):Promise<void>
    updateData(doctorId:string,updateData:Partial<IDoctor>,image?:Express.Multer.File):Promise<IDoctor | null>
    getDoctor(id:string):Promise<IDoctor | null>
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
      
}