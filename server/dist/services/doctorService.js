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
const types_1 = __importDefault(require("../di/types"));
const emailService_1 = __importDefault(require("../utils/emailService"));
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const jwtHelper_1 = require("../utils/jwtHelper");
const logger_1 = __importDefault(require("../utils/logger"));
let DoctorService = class DoctorService {
    constructor(doctorRepository) {
        this.doctorRepository = doctorRepository;
    }
    sendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Sending OTP to ${email}`);
            const doctor = yield this.doctorRepository.findDoctor(email);
            if (!doctor) {
                logger_1.default.warn(`Doctor not found for email: ${email}`);
                throw new Error("Doctor not found");
            }
            if (!doctor.isApproved) {
                logger_1.default.warn(`Unapproved doctor attempted OTP request: ${email}`);
                throw new Error("Doctor is not approved. Cannot send OTP.");
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log("OTP", otp);
            const otpExpiration = new Date(Date.now() + 1 * 60 * 1000);
            yield this.doctorRepository.updateOtp(email, otp, otpExpiration);
            yield (0, emailService_1.default)(email, otp);
            logger_1.default.info(`OTP sent successfully to ${email}`);
            return "OTP sent successfully.";
        });
    }
    verifyOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.doctorRepository.findDoctor(email);
            if (!doctor) {
                logger_1.default.warn(`Doctor not found during OTP verification: ${email}`);
                throw new Error("Doctor not found");
            }
            if (doctor.otp !== otp) {
                logger_1.default.warn(`Invalid OTP attempt for ${email}`);
                throw new Error("Invalid or expired OTP");
            }
            yield this.doctorRepository.verifyDoctor(email);
            if (!doctor.id) {
                logger_1.default.error("Doctor ID missing during token generation", { email });
                throw new Error("Doctor ID is missing");
            }
            const id = doctor.id.toString();
            const role = "doctor";
            console.log(`Generating tokens for ID: ${id}, Email: ${doctor.email}, Role: ${role}`);
            try {
                const accessToken = (0, jwtHelper_1.generateAccessToken)(id, doctor.email, role);
                const refreshToken = (0, jwtHelper_1.generateRefreshToken)(id, doctor.email, role);
                console.log('Access Token:', accessToken);
                console.log('Refresh Token:', refreshToken);
                if (!refreshToken) {
                    logger_1.default.error("Refresh token generation failed", { doctorId: id });
                    throw new Error("Refresh token generation failed");
                }
                return {
                    message: "OTP verified successfully. Redirecting to dashboard.",
                    id: id,
                    refreshToken,
                    accessToken
                };
            }
            catch (error) {
                console.error("Token generation error:", error);
                logger_1.default.error(`OTP verification failed for ${email}`);
                throw new Error("Failed to generate tokens");
            }
        });
    }
    resendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Resending OTP to ${email}`);
            return yield this.sendOtp(email);
        });
    }
    updateData(doctorId, updateData, image) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.debug(`Updating doctor data for ${doctorId}`);
                let imageUrl = updateData.profileImg;
                if (image) {
                    logger_1.default.debug(`Uploading image for doctor ${doctorId}`);
                    const cloudinaryResult = yield cloudinary_config_1.default.uploader.upload(image.path, {
                        folder: "doctor-profiles",
                    });
                    imageUrl = cloudinaryResult.secure_url;
                }
                const updatedDoctor = yield this.doctorRepository.updateDoctor(doctorId, Object.assign(Object.assign({}, updateData), { profileImg: imageUrl }));
                logger_1.default.info(`Doctor data updated successfully for ${doctorId}`);
                return updatedDoctor;
            }
            catch (error) {
                logger_1.default.error(`Error updating doctor ${doctorId}`, { error: error.stack });
                console.error("Error updating doctor:", error);
                throw error;
            }
        });
    }
    getDoctor(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Fetching doctor with ID: ${id}`);
            return yield this.doctorRepository.getDoctorById(id);
        });
    }
    googleAuth(email) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Processing Google auth for ${email}`);
            yield this.sendOtp(email);
        });
    }
    getApprovedDoctors() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 3, filters) {
            let result = yield this.doctorRepository.getApprovedDoctors(page, limit, filters);
            console.log("result", result);
            return result;
        });
    }
};
DoctorService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.DoctorRepository)),
    __metadata("design:paramtypes", [Object])
], DoctorService);
exports.default = DoctorService;
