import { IAdmin } from "../models/admin/adminInterface";
import { IPatient } from "../models/patient/patientInterface";

export interface IAdminRepo{
     findByEmail(email:string):Promise<IAdmin | null>
     togglePatientStatus(patientId:string):Promise<IPatient | null>
     // getPatient():Promise<IPatient[]>
}