import { IAdmin } from "../models/admin/adminInterface";
import { IPatient } from "../models/patient/patientInterface";

export interface IAdminRepo{
     findByEmail(email:string):Promise<IAdmin | null>
     // getPatient():Promise<IPatient[]>
}