import { IPatient } from "../models/patient/patientInterface";
import { IReview } from "../models/reviews/reviewInterface";
import { IBaseRepository } from "./base.repository";

export interface IPatientRepository extends IBaseRepository<IPatient> {
    findByEmail(email: string): Promise<IPatient | null>;
    verifyAndUpdatePatient(email: string): Promise<IPatient | null>;
    findByEmailAndUpdate(email:String,password:string) : Promise<IPatient | null>
    updateProfile(patientId: string, updates: Partial<IPatient>): Promise<IPatient>;
    changePassword(patientId: string, newPassword: string): Promise<void>;
    getTotalPatients():Promise<number>;
    createReview(reviewData:IReview):Promise<IReview>
    getReview(appointmentId:string):Promise<IReview | null>
    getReviewByDoctorId(doctorId:string):Promise<IReview[] | null>
}
