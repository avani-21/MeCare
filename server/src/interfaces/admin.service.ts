import { IAdmin } from "../models/admin/adminInterface";
import { IPatient } from "../models/patient/patientInterface";

export interface IAdminService{
    loginAdmin(email:string,password:string):Promise<{
        accessToken:string;
        refreshToken:string;
    }>

    togglePatientStatus(patientId:string):Promise<IPatient | null>
}