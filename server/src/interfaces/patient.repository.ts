import { IPatient } from "../models/patient/patientInterface";
import { IBaseRepository } from "./base.repository";

export interface IPatientRepository extends IBaseRepository<IPatient> {
    findByEmail(email: string): Promise<IPatient | null>;
    verifyAndUpdatePatient(email: string): Promise<IPatient | null>;
}
