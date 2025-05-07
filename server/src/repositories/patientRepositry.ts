import { injectable, inject } from "inversify";
import { BaseRepository } from "./baseRepositry";
import PatientModel from "../models/patient/patientModel";
import { IPatient } from "../models/patient/patientInterface";
import { IPatientRepository } from "../interfaces/patient.repository";
import { Model, Types } from "mongoose"; // Import Model
import  TYPES  from "../di/types"; // Import your types file
import { IReview } from "../models/reviews/reviewInterface";
import ReviewModel from "../models/reviews/reviewModel";

@injectable()
export class PatientRepository extends BaseRepository<IPatient> implements IPatientRepository {
    constructor(@inject(TYPES.PatientModel) patientModel: Model<IPatient>) { // Inject PatientModel
        super(patientModel);
    }

    async findByEmail(email: string): Promise<IPatient | null> {
        return this.findOne({ email });
    }
    

    async verifyAndUpdatePatient(email: string): Promise<IPatient | null> {
        return PatientModel.findOneAndUpdate(
            { email },
            { isVerified: true },
            { new: true }
        );
    }

    async findByEmailAndUpdate(email: String, password: string): Promise<IPatient | null> {
        return PatientModel.findOneAndUpdate({email},{password},{new:true})
    }

    async updateProfile(patientId: string, updates: Partial<IPatient>): Promise<IPatient> {
        const updatedPatient = await PatientModel.findByIdAndUpdate(
          patientId,
          { $set: updates },
          { new: true }
        )
    
        if (!updatedPatient) throw new Error("Patient not found");
        return updatedPatient;
      }
    
      async changePassword(patientId: string, newPassword: string): Promise<void> {
        const patient = await PatientModel.findById(patientId);
        if (!patient) throw new Error("Patient not found");
    
        patient.password = newPassword; 
        await patient.save();
      }

      async getTotalPatients(): Promise<number> {
        return PatientModel.countDocuments();
      }

      async createReview(reviewData: IReview): Promise<IReview> {
        const review=await ReviewModel.create({
          doctorId:new Types.ObjectId(reviewData.doctorId),
          patientId:new Types.ObjectId(reviewData.patientId),
          appointmentId:new Types.ObjectId(reviewData.appointmentId),
          ratings:reviewData.ratings,
          comment:reviewData.comment
        })

        return review
      }

      async getReview(appointmentId: string): Promise<IReview | null> {
         return await ReviewModel.findOne({appointmentId:appointmentId}).lean()
      }

       async getReviewByDoctorId(doctorId: string): Promise<IReview[] | null> {
          let reviews=await ReviewModel.find({doctorId:doctorId}).sort({createdAt:-1}).populate("patientId").exec()
          return reviews
      }
  
}