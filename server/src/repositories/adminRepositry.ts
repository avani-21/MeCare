import { injectable, inject } from "inversify";
import { BaseRepository } from "./baseRepositry";
import AdminModel from "../models/admin/adminModel"; 
import { IAdmin } from "../models/admin/adminInterface"; 
import { Model } from "mongoose";
import  TYPES  from "../di/types";
import { IPatient } from "../models/patient/patientInterface";
import PatientModel from "../models/patient/patientModel";

@injectable()
export class AdminRepository extends BaseRepository<IAdmin> { 
    constructor(@inject(TYPES.AdminModel) adminModel: Model<IAdmin>) {
        super(adminModel);
    }


 async findByEmail(email: string): Promise<IAdmin | null> {
  return this.findOne({ email });
}


}
