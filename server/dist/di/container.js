"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
// Services
const adminSrevice_1 = __importDefault(require("../services/adminSrevice"));
const patientService_1 = __importDefault(require("../services/patientService"));
const adminDoctor_1 = __importDefault(require("../services/adminDoctor"));
const doctorService_1 = __importDefault(require("../services/doctorService"));
// Repositories
const adminRepositry_1 = require("../repositories/adminRepositry");
const patientRepositry_1 = require("../repositories/patientRepositry");
const adminRegisterDoctorRepository_1 = require("../repositories/adminRegisterDoctorRepository");
const doctorRepository_1 = require("../repositories/doctorRepository");
//controllers
const adminController_1 = require("../controller/adminController");
const patientController_1 = __importDefault(require("../controller/patientController"));
const adminDoctorController_1 = __importDefault(require("../controller/adminDoctorController"));
const doctorController_1 = __importDefault(require("../controller/doctorController"));
//models
const adminModel_1 = __importDefault(require("../models/admin/adminModel"));
const doctorModel_1 = __importDefault(require("../models/doctor/doctorModel"));
const patientModel_1 = __importDefault(require("../models/patient/patientModel"));
const slotModel_1 = __importDefault(require("../models/slot/slotModel"));
const slotRepository_1 = require("../repositories/slotRepository");
const slotServie_1 = require("../services/slotServie");
const slotController_1 = require("../controller/slotController");
const appointmentModel_1 = __importDefault(require("../models/appointment/appointmentModel"));
const appointmentRepo_1 = require("../repositories/appointmentRepo");
const appointmentService_1 = require("../services/appointmentService");
const appointmentController_1 = require("../controller/appointmentController");
const prescriptionModel_1 = __importDefault(require("../models/prescription/prescriptionModel"));
const adminDashboardService_1 = require("../services/adminDashboardService");
const dashboardController_1 = require("../controller/dashboardController");
const doctorDashboard_1 = require("../services/doctorDashboard");
const reviewModel_1 = __importDefault(require("../models/reviews/reviewModel"));
const chatModel_1 = __importDefault(require("../models/chat/chatModel"));
const chatrRepository_1 = require("../repositories/chatrRepository");
const chatService_1 = require("../services/chatService");
const chatController_1 = require("../controller/chatController");
const container = new inversify_1.Container();
exports.container = container;
// Bind repositories
container.bind(types_1.default.AdminRepository).to(adminRepositry_1.AdminRepository);
container.bind(types_1.default.PatientRepository).to(patientRepositry_1.PatientRepository);
container.bind(types_1.default.DoctorRegRepository).to(adminRegisterDoctorRepository_1.AdminDoctorRepository);
container.bind(types_1.default.DoctorRepository).to(doctorRepository_1.DoctorRepository);
container.bind(types_1.default.SlotRepository).to(slotRepository_1.SlotRepository);
container.bind(types_1.default.AppointmentRepository).to(appointmentRepo_1.AppointmentRepo);
container.bind(types_1.default.ChatRepository).to(chatrRepository_1.ChatReposiorty);
// Bind services
container.bind(types_1.default.AdminService).to(adminSrevice_1.default);
container.bind(types_1.default.PatientService).to(patientService_1.default);
container.bind(types_1.default.DoctorRegService).to(adminDoctor_1.default);
container.bind(types_1.default.DoctorService).to(doctorService_1.default);
container.bind(types_1.default.SlotService).to(slotServie_1.SlotService);
container.bind(types_1.default.AppointmentService).to(appointmentService_1.AppointmentService);
container.bind(types_1.default.AdminDashboardService).to(adminDashboardService_1.AdminDashboardService);
container.bind(types_1.default.DoctorDashboardService).to(doctorDashboard_1.DoctorDashboardService);
container.bind(types_1.default.ChatService).to(chatService_1.ChatService);
//Bind controllers
container.bind(types_1.default.adminController).to(adminController_1.AdminController);
container.bind(types_1.default.DocRegController).to(adminDoctorController_1.default);
container.bind(types_1.default.PatientAuthController).to(patientController_1.default);
container.bind(types_1.default.DoctorController).to(doctorController_1.default);
container.bind(types_1.default.SlotController).to(slotController_1.SlotController);
container.bind(types_1.default.AppointmentController).to(appointmentController_1.AppointmentController);
container.bind(types_1.default.AdmindashboardController).to(dashboardController_1.DashboardController);
container.bind(types_1.default.ChatController).to(chatController_1.ChatController);
//model
container.bind(types_1.default.PatientModel).toConstantValue(patientModel_1.default);
container.bind(types_1.default.AdminModel).toConstantValue(adminModel_1.default);
container.bind(types_1.default.DoctorModel).toConstantValue(doctorModel_1.default);
container.bind(types_1.default.SlotModel).toConstantValue(slotModel_1.default);
container.bind(types_1.default.AppointmentModel).toConstantValue(appointmentModel_1.default);
container.bind(types_1.default.PrescriptionModel).toConstantValue(prescriptionModel_1.default);
container.bind(types_1.default.ReviewModel).toConstantValue(reviewModel_1.default);
container.bind(types_1.default.ChatModel).toConstantValue(chatModel_1.default);
