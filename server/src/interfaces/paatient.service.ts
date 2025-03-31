import { IPatient } from "../models/patient/patientInterface";

export interface IPatientService {
    registerPatient(
        name: string, 
        email: string, 
        password: string, 
        confirmPassword: string
    ): Promise<{ message: string; patientId: string }>;

    verifyOtp(email: string, otp: string): Promise<{ message: string }>;

    resendOtp(email: string): Promise<{ message: string }>;

    loginPatient(email: string, password: string): Promise<{ 
        accessToken: string; 
        refreshToken: string; 
        patientId: string; 
    }>;

    googleAuth(googleId:string,email:string):Promise<{accessToken:string,refreshToken:string}>
}
