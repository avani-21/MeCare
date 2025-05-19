import { IDoctor } from "../models/doctor/doctorInterface";
import { IPatient } from "../models/patient/patientInterface";

export interface IDocRegRepo {
   createDoctor(data: IDoctor): Promise<IDoctor>;
   findDoctorByEmail(email: string): Promise<IDoctor | null>;
   findDoctorByID(id: string): Promise<IDoctor | null>;
   updateDoctor(id: string, update: Partial<IDoctor>): Promise<IDoctor | null>;
   toggleDoctorApproval(id: string): Promise<IDoctor | null>;
   getPatient(page: number, limit: number): Promise<{ patients: IPatient[], total: number }>;
   findAllDoctors(page: number, limit: number,filters:{specialization?:string;}): Promise<{ doctors: IDoctor[], total: number }>;
   saveSlots(doctorId: string, slots: any): Promise<any>;
}