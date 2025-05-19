import { injectable, inject } from "inversify";
import { BaseRepository } from "./baseRepositry";
import AdminModel from "../models/admin/adminModel"; 
import { IAdmin } from "../models/admin/adminInterface"; 
import { Model } from "mongoose";
import  TYPES  from "../di/types";
import { IPatient } from "../models/patient/patientInterface";
import PatientModel from "../models/patient/patientModel";
import { IAdminRepo } from "../interfaces/admin.repo";
import { isBlock } from "typescript";

@injectable()
export class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepo { 
    constructor(
        @inject(TYPES.AdminModel) adminModel: Model<IAdmin>,
        @inject(TYPES.PatientModel) PatientModel:Model<IPatient>
) {
        super(adminModel);
  
    }


 async findByEmail(email: string): Promise<IAdmin | null> {
  return this.findOne({ email });
}
 
async togglePatientStatus(patientId: string): Promise<IPatient | null> {
     const patients=await PatientModel.findById(patientId)

     if(!patients){
        return null
     }
   
     patients.isBlock = !patients.isBlock
     return await patients.save()
    
}

}
