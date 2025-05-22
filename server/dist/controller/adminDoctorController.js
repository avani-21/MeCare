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
const inversify_1 = require("inversify");
const adminDoctor_1 = __importDefault(require("../services/adminDoctor"));
const types_1 = __importDefault(require("../di/types"));
const httptatus_1 = require("../utils/httptatus");
const types_2 = require("../types/types");
const logger_1 = __importDefault(require("../utils/logger"));
const message_1 = require("../utils/message");
let DocRegController = class DocRegController {
    constructor(doctorService) {
        this._doctorService = doctorService;
        logger_1.default.info("DocRegController initialized");
    }
    registerDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info("Attempting to register a new doctor");
                const doctorData = req.body;
                const files = req.files;
                logger_1.default.debug("Doctor registration data received", {
                    email: doctorData.email,
                    filesCount: files ? Object.keys(files).length : 0
                });
                const newDoctor = yield this._doctorService.registerDoctor(doctorData, files);
                //  console.log(newDoctor)
                logger_1.default.info("Doctor registered successfully", { doctorId: newDoctor.id });
                res.status(httptatus_1.HttpStatus.CREATED).json((0, types_2.successResponse)(message_1.StatusMessages.CREATED, newDoctor));
            }
            catch (error) {
                logger_1.default.error("Failed to register doctor", {
                    error: error.message,
                    stack: error.stack
                });
                res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(error.message));
            }
        });
    }
    getDoctorByEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.params;
                logger_1.default.info(`Fetching doctor by email: ${email}`);
                const doctor = yield this._doctorService.getDoctorByEmail(email);
                if (!doctor) {
                    logger_1.default.warn(`Doctor not found for email: ${email}`);
                    res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.NOT_FOUND));
                    return;
                }
                logger_1.default.debug("Doctor fetched successfully", { doctorId: doctor.id });
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, doctor));
            }
            catch (error) {
                logger_1.default.error("Error fetching doctor by email", {
                    error: error.message,
                    stack: error.stack
                });
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(error.message));
            }
        });
    }
    getAllDoctors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const filters = {
                    specialization: req.query.specialization,
                };
                logger_1.default.info("Fetching all doctors", {
                    page,
                    limit,
                    filters
                });
                const { doctors, total } = yield this._doctorService.getAllDoctors(page, limit, filters);
                logger_1.default.debug(`Fetched ${doctors.length} doctors out of ${total}`);
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, {
                    data: doctors,
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                        appliedFilters: Object.assign({}, (filters.specialization && { specialization: filters.specialization }))
                    }
                }));
            }
            catch (error) {
                logger_1.default.error("Error fetching all doctors", {
                    error: error.message,
                    stack: error.stack
                });
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(error.message));
            }
        });
    }
    updateDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctorId = req.params.id.replace(/^:/, "").trim();
                const updatedData = req.body;
                logger_1.default.info(`Attempting to update doctor with ID: ${doctorId}`, {
                    updatedFields: Object.keys(updatedData)
                });
                const updatedDoctorData = yield this._doctorService.updateDoctor(doctorId, updatedData);
                if (!updatedDoctorData) {
                    logger_1.default.warn(`Doctor not found for update: ${doctorId}`);
                    res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.NOT_FOUND));
                    return;
                }
                logger_1.default.info(`Doctor updated successfully: ${doctorId}`);
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, updatedDoctorData));
            }
            catch (error) {
                logger_1.default.error("Error updating doctor", {
                    doctorId: req.params.id,
                    error: error.message,
                    stack: error.stack
                });
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    toggleDoctorApproval(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctorId = req.params.id;
                logger_1.default.info(`Toggling approval for doctor: ${doctorId}`);
                const updateData = yield this._doctorService.toggleDoctorApproval(doctorId);
                if (!updateData) {
                    logger_1.default.warn(`Doctor not found for approval toggle: ${doctorId}`);
                    res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.NOT_FOUND));
                    return;
                }
                logger_1.default.info(`Doctor approval toggled successfully: ${doctorId}`, {
                    newStatus: updateData.isApproved
                });
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(`Doctor ${updateData.isApproved ? "approved" : "disapproved"} successfully`, updateData));
            }
            catch (error) {
                logger_1.default.error("Error toggling doctor approval", {
                    doctorId: req.params.id,
                    error: error.message,
                    stack: error.stack
                });
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    getAllPatients(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                logger_1.default.info("Fetching all patients", {
                    page,
                    limit
                });
                const { patients, total } = yield this._doctorService.getPatient(page, limit);
                logger_1.default.debug(`Fetched ${patients.length} patients out of ${total}`);
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, {
                    data: patients,
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    }
                }));
            }
            catch (error) {
                logger_1.default.error("Error fetching patients", {
                    error: error.message,
                    stack: error.stack
                });
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
};
DocRegController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.DoctorRegService)),
    __metadata("design:paramtypes", [adminDoctor_1.default])
], DocRegController);
exports.default = DocRegController;
