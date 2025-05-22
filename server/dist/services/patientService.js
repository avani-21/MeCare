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
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const jwtHelper_1 = require("../utils/jwtHelper");
const emailService_1 = __importDefault(require("../utils/emailService"));
const types_1 = __importDefault(require("../di/types"));
const logger_1 = __importDefault(require("../utils/logger"));
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
dotenv_1.default.config();
let PatientService = class PatientService {
    constructor(patientRepository) {
        this.patientRepository = patientRepository;
    }
    registerPatient(name, email, password, confirmPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug("Attempting to register patient:", email);
            if (password !== confirmPassword) {
                logger_1.default.warn("Password do not match");
                throw new Error("Passwords do not match");
            }
            const existingPatient = yield this.patientRepository.findByEmail(email);
            if (existingPatient) {
                logger_1.default.warn("Email alredy in use");
                throw new Error("Email already in use");
            }
            const hashPassword = yield bcrypt_1.default.hash(password, 10);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);
            logger_1.default.debug("creating a new pateint account");
            const newPatient = yield this.patientRepository.create({
                name,
                email,
                password: hashPassword,
                isVerified: false,
                otp,
                otpExpiration: otpExpiresAt,
            });
            logger_1.default.info("Sending otp to the  registered mail", email);
            yield (0, emailService_1.default)(email, otp);
            return { message: "Patient registered successfully, OTP sent for verification.", patientId: newPatient._id };
        });
    }
    verifyOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Verifying OTP for ${email}`);
            const patient = yield this.patientRepository.findByEmail(email);
            if (!patient) {
                logger_1.default.warn(`OTP verification attempt for non-existent patient: ${email}`);
                throw new Error("Patient not found");
            }
            if (patient.otp !== otp) {
                logger_1.default.warn(`Invalid OTP attempt for ${email}`);
                throw new Error("Invalid OTP");
            }
            logger_1.default.info(`Patient verified successfully: ${email}`);
            yield this.patientRepository.verifyAndUpdatePatient(email);
            return { message: "OTP verified successfully. You can now log in." };
        });
    }
    resendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Resending OTP to ${email}`);
            const patient = yield this.patientRepository.findByEmail(email);
            if (!patient) {
                logger_1.default.warn(`OTP resend attempt for non-existent patient: ${email}`);
                throw new Error("Patient not found");
            }
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            yield this.patientRepository.update(patient._id.toString(), { otp: newOtp });
            yield (0, emailService_1.default)(email, newOtp);
            logger_1.default.info(`OTP resent successfully to ${email}`);
            return { message: "New OTP sent successfully" };
        });
    }
    loginPatient(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Login attempt for patient: ${email}`);
            const patient = yield this.patientRepository.findByEmail(email);
            if (!patient) {
                logger_1.default.warn(`Login attempt for non-existent patient: ${email}`);
                throw new Error("Patient not found");
            }
            if (!patient.isVerified) {
                logger_1.default.warn(`Unverified patient login attempt: ${email}`);
                throw new Error("Please verify your account via OTP");
            }
            if (patient.isBlock) {
                logger_1.default.warn("Blocked user ty  to attemmpt login");
                throw new Error("You are Blocked by Admin");
            }
            const isValidPassword = yield bcrypt_1.default.compare(password, patient.password);
            if (!isValidPassword) {
                logger_1.default.warn(`Invalid password attempt for: ${email}`);
                throw new Error("Invalid credentials");
            }
            const accessToken = (0, jwtHelper_1.generateAccessToken)(patient._id.toString(), patient.email, "patient");
            const refreshToken = (0, jwtHelper_1.generateRefreshToken)(patient._id.toString(), patient.email, "patient");
            logger_1.default.info(`Patient logged in successfully: ${email}`);
            return { accessToken, refreshToken, patientId: patient._id };
        });
    }
    googleAuth(googleId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            let patient = yield this.patientRepository.findByEmail(email);
            logger_1.default.debug(`Google auth attempt for: ${email}`);
            if (!patient) {
                logger_1.default.debug(`Creating new patient via Google auth: ${email}`);
                const defaultPassword = "Google@123";
                const hashPassword = yield bcrypt_1.default.hash(defaultPassword, 10);
                patient = yield this.patientRepository.create({
                    email,
                    googleId,
                    password: hashPassword,
                    isVerified: true,
                });
            }
            else if (!patient.googleId) {
                logger_1.default.debug(`Linking Google ID to existing patient: ${email}`);
                yield this.patientRepository.update(patient._id.toString(), { googleId });
                patient = yield this.patientRepository.findByEmail(email);
            }
            if (!patient) {
                logger_1.default.error("Failed to create or update patient via Google auth");
                throw new Error("Failed to create or update patient.");
            }
            const accessToken = (0, jwtHelper_1.generateAccessToken)(patient._id.toString(), patient.email, "patient");
            const refreshToken = (0, jwtHelper_1.generateRefreshToken)(patient._id.toString(), patient.email, "patient");
            logger_1.default.info(`Google auth successful for: ${email}`);
            return { accessToken, refreshToken };
        });
    }
    resetPassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let hashPassword = yield bcrypt_1.default.hash(password, 10);
            const updatePassword = yield this.patientRepository.findByEmailAndUpdate(email, hashPassword);
            if (!updatePassword) {
                return { message: "patient not found", patient: null };
            }
            return { message: "Patient password resetted successfully", patient: updatePassword };
        });
    }
    getUserProfile(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.patientRepository.findByEmail(email);
        });
    }
    updateProfile(patientId, updates, image) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.debug("Updating patient profile");
                let imgURL = updates.profileImage;
                if (image) {
                    logger_1.default.debug("Uploading image for patient");
                    const cloudinaryResult = yield cloudinary_config_1.default.uploader.upload(image.path, {
                        folder: "patient_profile",
                    });
                    imgURL = cloudinaryResult.secure_url;
                }
                const updatedProfile = yield this.patientRepository.updateProfile(patientId, Object.assign(Object.assign({}, updates), { profileImage: imgURL }));
                logger_1.default.info("Patient profile data updated successfully");
                return updatedProfile;
            }
            catch (error) {
                logger_1.default.error("Error updating patient profile");
                console.error("Error updating patient profile:", error);
                throw error;
            }
        });
    }
    changePassword(patientId, newPassword, confirmPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newPassword !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
            yield this.patientRepository.changePassword(patientId, hashedPassword);
        });
    }
    createReview(reviewData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.patientRepository.createReview(reviewData);
        });
    }
    getReviewByAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.patientRepository.getReview(appointmentId);
        });
    }
    getReviewByDoctorId(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.patientRepository.getReviewByDoctorId(doctorId);
        });
    }
    updateReview(reviewId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.patientRepository.updateReview(reviewId, updateData);
        });
    }
};
PatientService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.PatientRepository)),
    __metadata("design:paramtypes", [Object])
], PatientService);
exports.default = PatientService;
