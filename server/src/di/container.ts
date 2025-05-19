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
import PatientAuthController from "../controller/patientController";
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
import { ISlot } from "../models/slot/slotInterface";
import SlotModel from "../models/slot/slotModel";
import { SlotRepo } from "../interfaces/slot.repo";
import { SlotRepository } from "../repositories/slotRepository";
import { ISlotService } from "../interfaces/slot.service";
import { SlotService } from "../services/slotServie";
import { SlotController } from "../controller/slotController";

import { IAppointment } from "../models/appointment/appointmentInterface";

import AppointmentModel from "../models/appointment/appointmentModel";
import { AppointmentRepo } from "../repositories/appointmentRepo";
import { IAppointmentService } from "../interfaces/appointmentService";
import { AppointmentService } from "../services/appointmentService";
import { AppointmentController } from "../controller/appointmentController";
import { IAppointmentRepository } from "../interfaces/appointmentRepo";
import { IPrescription } from "../models/prescription/priscriptionInterface";
import PrescriptioModel from "../models/prescription/prescriptionModel";
import { IAdminDashboard } from "../interfaces/admin.dashboard.service";
import { AdminDashboardService} from "../services/adminDashboardService";
import { DashboardController } from "../controller/dashboardController";
import { IDoctorDashboard } from "../interfaces/doctor.dashboard.service";
import { TYPE } from "inversify-express-utils";
import { DoctorDashboardService } from "../services/doctorDashboard";
import { IReview } from "../models/reviews/reviewInterface";
import ReviewModel from "../models/reviews/reviewModel";
import { IChat } from "../models/chat/chatInterface";
import ChatModel from "../models/chat/chatModel";
import { IChatRepository } from "../interfaces/chatRepositort";
import { ChatReposiorty } from "../repositories/chatrRepository";
import { IChatService } from "../interfaces/chat.service";
import { ChatService } from "../services/chatService";
import { ChatController } from "../controller/chatController";



const container = new Container();

// Bind repositories
container.bind<IAdminRepo>(TYPES.AdminRepository).to(AdminRepository);
container.bind<IPatientRepository>(TYPES.PatientRepository).to(PatientRepository);
container.bind<IDocRegRepo>(TYPES.DoctorRegRepository).to(AdminDoctorRepository);
container.bind<IDoctorRepo>(TYPES.DoctorRepository).to(DoctorRepository)
container.bind<SlotRepo>(TYPES.SlotRepository).to(SlotRepository)
container.bind<IAppointmentRepository>(TYPES.AppointmentRepository).to(AppointmentRepo)
container.bind<IChatRepository>(TYPES.ChatRepository).to(ChatReposiorty)

// Bind services
container.bind<IAdminService>(TYPES.AdminService).to(AdminService);
container.bind<IPatientService>(TYPES.PatientService).to(PatientService);
container.bind<IDoctorRegService>(TYPES.DoctorRegService).to(AdminDoctorService);
container.bind<IDoctorService>(TYPES.DoctorService).to(DoctorService)
container.bind<ISlotService>(TYPES.SlotService).to(SlotService);
container.bind<IAppointmentService>(TYPES.AppointmentService).to(AppointmentService)
container.bind<IAdminDashboard>(TYPES.AdminDashboardService).to(AdminDashboardService)
container.bind<IDoctorDashboard>(TYPES.DoctorDashboardService).to(DoctorDashboardService)
container.bind<IChatService>(TYPES.ChatService).to(ChatService)



//Bind controllers

container.bind<AdminController>(TYPES.adminController).to(AdminController)
container.bind<DocRegController>(TYPES.DocRegController).to(DocRegController)
container.bind<PatientAuthController>(TYPES.PatientAuthController).to(PatientAuthController)
container.bind<DoctorController>(TYPES.DoctorController).to(DoctorController)
container.bind<SlotController>(TYPES.SlotController).to(SlotController)
container.bind<AppointmentController>(TYPES.AppointmentController).to(AppointmentController)
container.bind<DashboardController>(TYPES.AdmindashboardController).to(DashboardController)
container.bind<ChatController>(TYPES.ChatController).to(ChatController)


//model

container.bind<Model<IPatient>>(TYPES.PatientModel).toConstantValue(PatientModel)
container.bind<Model<IAdmin>>(TYPES.AdminModel).toConstantValue(AdminModel)
container.bind<Model<IDoctor>>(TYPES.DoctorModel).toConstantValue(DoctorModel)
container.bind<Model<ISlot>>(TYPES.SlotModel).toConstantValue(SlotModel)
container.bind<Model<IAppointment>>(TYPES.AppointmentModel).toConstantValue(AppointmentModel)
container.bind<Model<IPrescription>>(TYPES.PrescriptionModel).toConstantValue(PrescriptioModel)
container.bind<Model<IReview>>(TYPES.ReviewModel).toConstantValue(ReviewModel)
container.bind<Model<IChat>>(TYPES.ChatModel).toConstantValue(ChatModel)


export { container };
