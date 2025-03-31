import { IDoctor } from "../models/doctor/doctorInterface";
import { IPatient } from "../models/patient/patientInterface";

export interface IDoctorRegService {
  registerDoctor(doctorData: Partial<IDoctor>,files:any): Promise<IDoctor>;
  getDoctorByEmail(email: string): Promise<IDoctor | null>;
  getAllDoctors(page:number,limit:number,filters:{specialization?:string;}): Promise<{doctors:IDoctor[],total:number}>;
  updateDoctor(id: string, updateData: Partial<IDoctor>, files: any): Promise<IDoctor | null>;
  toggleDoctorApproval(id:string):Promise<IDoctor | null>
  getPatient(page:number,limit:number):Promise<{patients:IPatient[],total:number}>
}
