"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardService = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
let AdminDashboardService = class AdminDashboardService {
    constructor(_appointmentRepository, _doctorRepository, _patientRepository) {
        this._appointmentRepository = _appointmentRepository;
        this._doctorRepository = _doctorRepository;
        this._patientRepository = _patientRepository;
    }
    getAdminDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            const [doctors, patients, appointments, latestAppointments] = yield Promise.all([
                this._doctorRepository.getAllDoctors(),
                this._patientRepository.getTotalPatients(),
                this._appointmentRepository.getTotalAppointment(),
                this._appointmentRepository.getLatestAppointment()
            ]);
            let totalProfit = 0;
            const allAppointments = yield this._appointmentRepository.getAllAppointments();
            for (const appointment of allAppointments) {
                if (appointment.paymentStatus === 'paid') {
                    totalProfit += 120;
                }
                if (appointment.status === 'completed') {
                    if (typeof appointment.doctorId === 'object' && 'consultantFee' in appointment.doctorId) {
                        totalProfit += appointment.doctorId.consultantFee;
                    }
                }
            }
            return {
                summary: {
                    doctors,
                    patients,
                    appointments,
                    profit: totalProfit
                },
                latestAppointments
            };
        });
    }
    getProfitData(range) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._appointmentRepository.getProfitData(range);
        });
    }
    getCustomProfitData(dateRange) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._appointmentRepository.getCustomProfitData(dateRange);
        });
    }
};
exports.AdminDashboardService = AdminDashboardService;
exports.AdminDashboardService = AdminDashboardService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.AppointmentRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.DoctorRepository)),
    __param(2, (0, inversify_1.inject)(types_1.default.PatientRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], AdminDashboardService);
