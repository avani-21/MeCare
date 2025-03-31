import { Container } from "inversify";
import TYPES  from "../di/types";
import { IAdminRepo } from "../interfaces/admin.repo";
import { IAdminService } from "../interfaces/admin.service";
import { IPatientService } from "../interfaces/paatient.service";
import { IPatientRepository } from "../interfaces/patient.repository";
import { IDocRegRepo } from "../interfaces/register.doctor.repo";
import { IDoctorRegService } from "../interfaces/register.doctor.service";

// Services
import  AdminService  from "../services/adminSrevice";
import  PatientService  from "../services/patientService";
import  AdminDoctorService  from "../services/adminDoctor";
import DoctorService from "../services/doctorService";

// Repositories
import  {AdminRepository}  from "../repositories/adminRepositry";
import { PatientRepository } from "../repositories/patientRepositry";
import { AdminDoctorRepository } from "../repositories/adminRegisterDoctorRepository";
import { DoctorRepository } from "../repositories/doctorRepository";


//controllers
import { AdminController } from "../controller/adminController";
import PatientAuthController from "../controller/patientAuthController";
import DocRegController from "../controller/adminDoctorController";
import DoctorController from "../controller/doctorController";

//models
import AdminModel from "../models/admin/adminModel";
import { IAdmin } from "../models/admin/adminInterface";
import DoctorModel from "../models/doctor/doctorModel";
import { IDoctor } from "../models/doctor/doctorInterface";
import PatientModel from "../models/patient/patientModel";
import { IPatient } from "../models/patient/patientInterface";
import { Model } from "mongoose";
import { IDoctorRepo } from "../interfaces/doctor.repo";
import { IDoctorService } from "../interfaces/doctorService";

const container = new Container();

// Bind repositories
container.bind<IAdminRepo>(TYPES.AdminRepository).to(AdminRepository);
container.bind<IPatientRepository>(TYPES.PatientRepository).to(PatientRepository);
container.bind<IDocRegRepo>(TYPES.DoctorRegRepository).to(AdminDoctorRepository);
container.bind<IDoctorRepo>(TYPES.DoctorRepository).to(DoctorRepository)

// Bind services
container.bind<IAdminService>(TYPES.AdminService).to(AdminService);
container.bind<IPatientService>(TYPES.PatientService).to(PatientService);
container.bind<IDoctorRegService>(TYPES.DoctorRegService).to(AdminDoctorService);
container.bind<IDoctorService>(TYPES.DoctorService).to(DoctorService)


//Bind controllers

container.bind<AdminController>(TYPES.adminController).to(AdminController)
container.bind<DocRegController>(TYPES.DocRegController).to(DocRegController)
container.bind<PatientAuthController>(TYPES.PatientAuthController).to(PatientAuthController)
container.bind<DoctorController>(TYPES.DoctorController).to(DoctorController)

//model

container.bind<Model<IPatient>>(TYPES.PatientModel).toConstantValue(PatientModel)
container.bind<Model<IAdmin>>(TYPES.AdminModel).toConstantValue(AdminModel)
container.bind<Model<IDoctor>>(TYPES.DoctorModel).toConstantValue(DoctorModel)



export { container };
