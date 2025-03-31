import { IDoctor } from "../models/doctor/doctorInterface";

export interface IDoctorRepo{
    getApprovedDoctors():Promise<IDoctor[] | null>
    findDoctor(email:string):Promise<IDoctor | null>
    updateOtp(email:string,otp:string,otpExpiration:Date):Promise<void>
    verifyDoctor(email: string): Promise<void>;
    getDoctorById(id:string):Promise<IDoctor | null>
    updateDoctor(doctorId:string,updateData:Partial<IDoctor>):Promise<IDoctor | null>
    
}