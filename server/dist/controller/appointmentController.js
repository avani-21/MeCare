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
exports.AppointmentController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const httptatus_1 = require("../utils/httptatus");
const types_2 = require("../types/types");
const logger_1 = __importDefault(require("../utils/logger"));
const mongoose_1 = require("mongoose");
const message_1 = require("../utils/message");
let AppointmentController = class AppointmentController {
    constructor(_appointmentService) {
        this._appointmentService = _appointmentService;
    }
    bookAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let patientId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            try {
                const { doctorId, slotId, date, startTime, endTime } = req.body;
                if (!patientId) {
                    return res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                const appointment = yield this._appointmentService.handleAppointmentBooking({
                    patientId: new mongoose_1.Types.ObjectId(patientId),
                    doctorId,
                    slotId,
                    date: new Date(date),
                    startTime,
                    endTime,
                    status: "pending",
                    paymentStatus: "unpaid",
                    amount: 120
                });
                res.status(httptatus_1.HttpStatus.CREATED).json((0, types_2.successResponse)(message_1.StatusMessages.OK, appointment));
            }
            catch (error) {
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    getSingleAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!id) {
                    logger_1.default.warn("Appointment id is missing");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                let appointment = yield this._appointmentService.getSingleAppointment(id);
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, appointment));
            }
            catch (error) {
                logger_1.default.error(error.message);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    checkOutSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, doctorName, id: appointmentId } = req.body;
                const session = yield this._appointmentService.checkout(amount, doctorName, appointmentId);
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, session));
            }
            catch (error) {
                console.error('Checkout error:', error);
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    markAppointmentpaid(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const appointmentId = req.body.id;
                if (!appointmentId) {
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                yield this._appointmentService.markAsPaid(appointmentId);
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)("Appointment marked as paid"));
            }
            catch (error) {
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)("Failed to update payment status", error.message));
            }
        });
    }
    getPatientAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                console.log("authId", (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const id = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const filter = req.query.filterStatus;
                console.log("filter status", filter);
                console.log("patientId", id);
                if (!id) {
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                let response = yield this._appointmentService.getPatientAppointment(id, page, limit, filter);
                console.log(response);
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
            }
            catch (error) {
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    getDoctorAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const status = req.query.status || 'all';
                const startDate = req.query.startDate;
                const endDate = req.query.endDate;
                const searchQuery = req.query.searchQuery;
                if (!doctorId) {
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.BAD_REQUEST));
                }
                let response = yield this._appointmentService.getDoctorAppointment(doctorId, page, limit, status, startDate, endDate, searchQuery === null || searchQuery === void 0 ? void 0 : searchQuery.trim());
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
            }
            catch (error) {
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    getAllAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                let appointments = yield this._appointmentService.getAllAppointments(page, limit);
                if (appointments) {
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, appointments));
                }
            }
            catch (error) {
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    changeAppointmentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let appointmentId = req.params.id;
                const { status } = req.body;
                console.log(req.body);
                if (!appointmentId) {
                    logger_1.default.warn("Appointment id is missing");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                if (!status || !['booked', 'completed', 'cancelled', 'pending'].includes(status)) {
                    logger_1.default.warn("Invalid status provided");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.BAD_REQUEST));
                }
                console.log(req.body);
                let response = yield this._appointmentService.changeAppointmentStatus(appointmentId, status);
                console.log(response);
                if (response) {
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
                }
            }
            catch (error) {
                logger_1.default.error("Error occured while updatinging the status", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.successResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
    // async createPrescription(req: Request, res: Response) {
    //     try {
    //         console.log(req.body);
    //         const medicationsArray = req.body.medications
    //             .split(/[\n,]/)
    //             .map((med: string) => med.trim())
    //             .filter((med: string) => med.length > 0);
    //         const prescriptionData: IPrescription = {
    //             appointmentId: req.body.appointmentId,
    //             doctorId: req.params.id,
    //             patientId: req.body.patientId,
    //             diagnosis: req.body.diagnosis,
    //             medications: medicationsArray, 
    //             instructions: req.body.instructions,
    //         };
    //         let response = await this._appointmentService.createPrescription(prescriptionData);
    //         if (response) {
    //             logger.info("Prescription created successfully");
    //             return res.status(HttpStatus.CREATED).json(
    //                 successResponse(StatusMessages.CREATED, response)
    //             );
    //         }
    //     } catch (error: any) {
    //         logger.error("Error adding prescription", error);
    //         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
    //             errorResponse(StatusMessages.INTERNAL_SERVER_ERROR, error.message)
    //         );
    //     }
    // }
    createPrescription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { appointmentId, patientId, diagnosis, instructions, medications } = req.body;
                const doctorId = req.params.id;
                if (!Array.isArray(medications)) {
                    throw new Error("Medication must be an array of object");
                }
                for (const med of medications) {
                    if (!med.frequency || !med.name || !med.dosage || !med.duration) {
                        throw new Error("Each medication  must have a name,duration,frequency,and dosage");
                    }
                }
                const prescriptionData = {
                    appointmentId,
                    doctorId,
                    patientId,
                    diagnosis,
                    medications,
                    instructions
                };
                const response = yield this._appointmentService.createPrescription(prescriptionData);
                if (response) {
                    logger_1.default.info("Prescription created successfully");
                    return res.status(httptatus_1.HttpStatus.CREATED).json((0, types_2.successResponse)(message_1.StatusMessages.CREATED, response));
                }
            }
            catch (error) {
                logger_1.default.error("Error adding  prescription");
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    getPrescription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { appointmentId } = req.params;
                const prescription = yield this._appointmentService.getPrescription(appointmentId);
                if (!prescription) {
                    logger_1.default.warn("No prescription found");
                    return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.NOT_FOUND));
                }
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, prescription));
            }
            catch (error) {
                logger_1.default.warn("Error fetching prescription");
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
    getDoctorByPatient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!patientId) {
                    logger_1.default.warn("Patient id is missing");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                let response = yield this._appointmentService.getDoctorByPatient(patientId);
                if (response) {
                    logger_1.default.info("Doctors data fetched successfully");
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
                }
                return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.NOT_FOUND));
            }
            catch (error) {
                logger_1.default.error("Internal server error", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR)
                    .json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
    getPatientsByDoctors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!doctorId) {
                    logger_1.default.warn("Doctor is  missing in the request");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                let response = yield this._appointmentService.getPatientsByDoctors(doctorId);
                if (response) {
                    logger_1.default.info("patient data fetched successfully");
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
                }
                return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.NOT_FOUND));
            }
            catch (error) {
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
};
exports.AppointmentController = AppointmentController;
exports.AppointmentController = AppointmentController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.AppointmentService)),
    __metadata("design:paramtypes", [Object])
], AppointmentController);
