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
const patientService_1 = __importDefault(require("../services/patientService"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtHelper_1 = require("../utils/jwtHelper");
const types_1 = __importDefault(require("../di/types"));
const httptatus_1 = require("../utils/httptatus");
const types_2 = require("../types/types");
const logger_1 = __importDefault(require("../utils/logger"));
const message_1 = require("../utils/message");
let PatientAuthController = class PatientAuthController {
    constructor(_patientService) {
        this._patientService = _patientService;
        logger_1.default.info("PatientAuthController initialized");
    }
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, confirmPassword } = req.body;
                logger_1.default.debug(`Patient signup attempt for ${email}`);
                const result = yield this._patientService.registerPatient(name, email, password, confirmPassword);
                logger_1.default.info(`Patient ${email} registered successfully`);
                res.status(httptatus_1.HttpStatus.CREATED).json((0, types_2.successResponse)(message_1.StatusMessages.REGISTRATION_SUCCESS, result));
            }
            catch (error) {
                logger_1.default.error(`Patient signup failed for ${req.body.email}`, { error: error.message });
                res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                logger_1.default.debug(`Verifying OTP for ${email}`);
                const result = yield this._patientService.verifyOtp(email, otp);
                logger_1.default.info(`OTP verified for ${email}`);
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, result));
            }
            catch (error) {
                logger_1.default.error(`OTP verification failed for ${req.body.email}`, { error: error.message });
                res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    resendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                logger_1.default.debug(`Resending OTP to ${email}`);
                const result = yield this._patientService.resendOtp(email);
                logger_1.default.info(`OTP resent to ${email}`);
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OTP_SENT, result));
            }
            catch (error) {
                logger_1.default.error(`OTP resend failed for ${req.body.email}`, { error: error.message });
                res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                logger_1.default.debug(`Login attempt for ${email}`);
                const result = yield this._patientService.loginPatient(email, password);
                const { accessToken, refreshToken, patientId } = result;
                logger_1.default.info(`Patient ${email} logged in successfully`);
                res.cookie("patientToken", accessToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 1 * 24 * 60 * 60 * 1000,
                });
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.status(httptatus_1.HttpStatus.OK).json({ accessToken, patientId });
            }
            catch (error) {
                logger_1.default.error(`Login failed for ${req.body.email}`, { error: error.message });
                res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    return res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json({
                        error: "Refresh Token missing",
                        code: "REFRESH_TOKEN_MISSING"
                    });
                }
                jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decode) => {
                    if (err) {
                        return res.status(httptatus_1.HttpStatus.FORBIDDEN).json({
                            error: "Invalid Refresh token",
                            code: "INVALID_REFRESH_TOKEN"
                        });
                    }
                    const newAccessToken = (0, jwtHelper_1.generateAccessToken)(decode.id, decode.email, "patient");
                    // Set the new access token in cookie
                    res.cookie("patientToken", newAccessToken, {
                        httpOnly: false,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                        maxAge: 15 * 60 * 1000 // 15 minutes
                    });
                    return res.status(httptatus_1.HttpStatus.OK).json({
                        accessToken: newAccessToken,
                        expiresIn: 15 * 60 // Tell frontend when it expires
                    });
                });
            }
            catch (error) {
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: "Token refresh failed",
                    code: "REFRESH_FAILED"
                });
            }
        });
    }
    googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { googleId, email } = req.body;
                logger_1.default.debug(`Google auth attempt for ${email}`);
                if (!googleId || !email) {
                    logger_1.default.warn("Google auth missing required fields");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.BAD_REQUEST));
                }
                const tokens = yield this._patientService.googleAuth(googleId, email);
                const { accessToken, refreshToken } = tokens;
                logger_1.default.info(`Google auth successful for ${email}`);
                res.cookie("patientToken", accessToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 1 * 24 * 60 * 60 * 1000,
                });
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, tokens));
            }
            catch (error) {
                logger_1.default.error(`Google auth failed for ${req.body.email}`, { error: error.message });
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    sendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    logger_1.default.warn("Email  is  not provided");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.EMAIL_REQUIRED));
                }
                let result = yield this._patientService.resendOtp(email);
                logger_1.default.info("OTP send to your email successfully");
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OTP_SENT, result));
            }
            catch (error) {
                logger_1.default.error("Error sending otp", error.message);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email) {
                    logger_1.default.warn("Patient not fount");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.EMAIL_REQUIRED));
                }
                if (!password) {
                    logger_1.default.warn("Password not provided");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.BAD_REQUEST));
                }
                let result = yield this._patientService.resetPassword(email, password);
                logger_1.default.info("Password resetted successfully");
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, result));
            }
            catch (error) {
                logger_1.default.error(error.message);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    getPatientProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = req.user;
                if (!user) {
                    logger_1.default.warn("No user information found in request");
                    return res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json((0, types_2.errorResponse)("Authentication required"));
                }
                const email = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
                if (!email) {
                    logger_1.default.warn("No email found in JWT payload");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.EMAIL_REQUIRED));
                }
                const patient = yield this._patientService.getUserProfile(email);
                logger_1.default.info("Patient profile fetched successfully");
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, patient));
            }
            catch (error) {
                logger_1.default.error("Error fetching user profile");
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                console.log(patientId);
                console.log(req.body);
                console.log("image", req.file);
                if (!patientId) {
                    logger_1.default.warn("No patient ID found in request");
                    return res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json((0, types_2.errorResponse)("Authentication required"));
                }
                logger_1.default.debug(`Updating profile for patient ${patientId}`);
                const updatedPatient = yield this._patientService.updateProfile(patientId, req.body, req.file);
                if (updatedPatient) {
                    logger_1.default.info(`Doctor ${patientId} updated successfully`);
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)("Profile updated successfully", updatedPatient));
                }
                else {
                    logger_1.default.warn(`Doctor not found for update: ${patientId}`);
                    return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)("Doctor not found"));
                }
            }
            catch (error) {
                logger_1.default.error("Error updating patient profile", { error: error.message });
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)("Error updating profile", error.message));
            }
        });
    }
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!patientId) {
                    logger_1.default.warn("No patient ID found in request");
                    return res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json((0, types_2.errorResponse)("Authentication required"));
                }
                const { newPassword, confirmPassword } = req.body;
                if (!newPassword || !confirmPassword) {
                    logger_1.default.warn("Password fields are missing");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)("New password and confirm password are required"));
                }
                if (newPassword !== confirmPassword) {
                    logger_1.default.warn("Passwords do not match");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)("Passwords do not match"));
                }
                yield this._patientService.changePassword(patientId, newPassword, confirmPassword);
                logger_1.default.info(`Password changed successfully for patient ${patientId}`);
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)("Password changed successfully"));
            }
            catch (error) {
                logger_1.default.error("Error changing password", { error: error.message });
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)("Error changing password", error.message));
            }
        });
    }
    createReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reviewData = {
                    doctorId: req.params.doctorId,
                    patientId: req.body.patientId,
                    appointmentId: req.body.appointmentId,
                    ratings: req.body.ratings,
                    comment: req.body.comment
                };
                let response = yield this._patientService.createReview(reviewData);
                if (response) {
                    logger_1.default.info("Review Added successfully");
                    return res.status(httptatus_1.HttpStatus.CREATED).json((0, types_2.successResponse)(message_1.StatusMessages.CREATED, response));
                }
            }
            catch (error) {
                logger_1.default.error("Error adding review", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
    getReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let appointmentId = req.params.appointmentId;
                console.log(appointmentId);
                if (!appointmentId) {
                    logger_1.default.error("Appointment ID is required");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.BAD_REQUEST, "Appointment ID is required"));
                }
                let response = yield this._patientService.getReviewByAppointment(appointmentId);
                if (response) {
                    logger_1.default.info("Review fwtched successfully");
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
                }
                else {
                    logger_1.default.info("No review found for this appointment");
                    return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.NOT_FOUND, "No review found"));
                }
            }
            catch (error) {
                logger_1.default.error("error fetching review");
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
    getReviewByDoctorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let doctorId = req.params.doctorId;
                if (!doctorId) {
                    logger_1.default.warn("Doctor id is missing");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                let response = yield this._patientService.getReviewByDoctorId(doctorId);
                if (response) {
                    logger_1.default.info("Doctor review fetched successfully");
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
                }
            }
            catch (error) {
                logger_1.default.error("Error ocuuered during review data fetching", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    logOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("accessToken", {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
                });
                logger_1.default.info("JWT cleared from cooki successfully");
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK));
            }
            catch (error) {
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    updateReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reviewId = req.params.reviewId;
                const updatedData = {
                    ratings: req.body.ratings,
                    comment: req.body.comment
                };
                if (!reviewId) {
                    logger_1.default.warn("review id is required");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                const response = yield this._patientService.updateReview(reviewId, updatedData);
                if (response) {
                    logger_1.default.info("Review updated successfully");
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
                }
                else {
                    logger_1.default.info("Review not found");
                    return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.NOT_FOUND, "Review not found"));
                }
            }
            catch (error) {
                logger_1.default.error("Error updting review", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
};
PatientAuthController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.PatientService)),
    __metadata("design:paramtypes", [patientService_1.default])
], PatientAuthController);
exports.default = PatientAuthController;
