import { IPatient } from "../models/patient/patientInterface";
import { IReview } from "../models/reviews/reviewInterface";

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

    resetPassword(email:string,password:string):Promise<{message:string,patient:IPatient | null}>
    getUserProfile(email:string):Promise<IPatient | null>

    updateProfile(patientId: string, updates: Partial<IPatient>,image?: Express.Multer.File): Promise<IPatient>;
    changePassword(patientId: string, newPassword: string, confirmPassword: string): Promise<void>;
    createReview(reviewData:IReview):Promise<IReview>
    getReviewByAppointment(appointmentId:string):Promise<IReview | null>
    getReviewByDoctorId(doctorId:string):Promise<IReview[] | null>
    updateReview(reviewId: string, updateData: Partial<IReview>): Promise<IReview | null>
}
