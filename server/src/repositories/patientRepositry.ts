import { injectable, inject } from "inversify";
import { BaseRepository } from "./baseRepositry";
import PatientModel from "../models/patient/patientModel";
import { IPatient } from "../models/patient/patientInterface";
import { IPatientRepository } from "../interfaces/patient.repository";
import { Model } from "mongoose"; // Import Model
import  TYPES  from "../di/types"; // Import your types file

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

}