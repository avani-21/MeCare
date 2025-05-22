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
exports.AppointmentService = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const slotServie_1 = require("../services/slotServie");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
let AppointmentService = class AppointmentService {
    constructor(_appointmentRepository, _slotService, _slotRepository // <-- Add this
    ) {
        this._appointmentRepository = _appointmentRepository;
        this._slotService = _slotService;
        this._slotRepository = _slotRepository; // <-- Initialize it
    }
    handleAppointmentBooking(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { patientId, doctorId, slotId, date, startTime, endTime } = data;
            const isSlotAvailable = yield this._slotService.checkSlotAvailability(slotId.toString());
            if (!isSlotAvailable) {
                throw new Error("Slot is not available");
            }
            const appointmentId = `APP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const appointment = yield this._appointmentRepository.createAppointment({
                patientId: new mongoose_1.default.Types.ObjectId(patientId),
                doctorId: new mongoose_1.default.Types.ObjectId(doctorId),
                slotId: new mongoose_1.default.Types.ObjectId(slotId),
                appointmentId,
                date,
                startTime,
                endTime,
                status: "pending",
                paymentStatus: "unpaid",
                amount: 120,
            });
            yield this._slotRepository.markSlotAsBooked(slotId.toString());
            return appointment;
        });
    }
    getSingleAppointment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._appointmentRepository.getSingleAppointment(id);
        });
    }
    checkout(amount, doctorName, appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._appointmentRepository.createCheckoutSession(amount, doctorName, appointmentId);
        });
    }
    markAsPaid(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._appointmentRepository.updatePaymentStatus(appointmentId);
        });
    }
    getPatientAppointment(id_1, page_1, limit_1) {
        return __awaiter(this, arguments, void 0, function* (id, page, limit, filterStatus = "all") {
            let appointment = yield this._appointmentRepository.getPatientAppointment(id, page, limit, filterStatus);
            return appointment;
        });
    }
    getDoctorAppointment(doctorId_1) {
        return __awaiter(this, arguments, void 0, function* (doctorId, page = 1, limit = 5, status = 'all', startDate, endDate, searchQuery) {
            const appointments = yield this._appointmentRepository.getDoctorAppointment(doctorId, page, limit, status, startDate, endDate, searchQuery);
            return appointments;
        });
    }
    getAllAppointments() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            let appointments = yield this._appointmentRepository.getAllAppointment(page, limit);
            return appointments;
        });
    }
    changeAppointmentStatus(appointmentId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this._appointmentRepository.getSingleAppointment(appointmentId);
            if (!appointment) {
                return null;
            }
            if (appointment.status === 'completed' && status !== 'completed') {
                throw new Error('Cannot change status from completed');
            }
            if (appointment.status === "cancelled" && status === "completed") {
                throw new Error("Can not change status from cancelled to completed");
            }
            let result = yield this._appointmentRepository.changeAppointmentStatus(appointmentId, status);
            return result;
        });
    }
    createPrescription(prescriptionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!prescriptionData.appointmentId || !prescriptionData.doctorId ||
                    !prescriptionData.patientId || !prescriptionData.diagnosis) {
                    throw new Error('Missing required fields');
                }
                if (!Array.isArray(prescriptionData.medications)) {
                    throw new Error('Medications must be an array');
                }
                for (const med of prescriptionData.medications) {
                    if (!med.name || !med.duration || !med.frequency || !med.dosage) {
                        throw new Error("Each medication must have name,frequency,dosage and duration");
                    }
                }
                return yield this._appointmentRepository.createPrescription(prescriptionData);
            }
            catch (error) {
                logger_1.default.error('Error in prescription service', error);
                throw error;
            }
        });
    }
    getPrescription(AppointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._appointmentRepository.getPrescription(AppointmentId);
        });
    }
    getDoctorByPatient(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._appointmentRepository.getDoctorsByPatient(patientId);
        });
    }
    getPatientsByDoctors(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._appointmentRepository.getPatientsByDoctors(doctorId);
        });
    }
};
exports.AppointmentService = AppointmentService;
exports.AppointmentService = AppointmentService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.AppointmentRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.SlotService)),
    __param(2, (0, inversify_1.inject)(types_1.default.SlotRepository)),
    __metadata("design:paramtypes", [Object, slotServie_1.SlotService, Object])
], AppointmentService);
