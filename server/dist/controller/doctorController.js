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
const httptatus_1 = require("../utils/httptatus");
const types_2 = require("../types/types");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtHelper_1 = require("../utils/jwtHelper");
const logger_1 = __importDefault(require("../utils/logger"));
const message_1 = require("../utils/message");
let DoctorController = class DoctorController {
    constructor(_doctorService) {
        this._doctorService = _doctorService;
        logger_1.default.info("DoctorController initialized");
    }
    getApprovedDoctors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const filters = {};
                if (req.query.specialization) {
                    filters.specialization = req.query.specialization;
                }
                if (req.query.gender) {
                    filters.gender = req.query.gender;
                }
                if (req.query.experience) {
                    filters.experience = parseInt(req.query.experience);
                }
                if (req.query.searchQuery) {
                    filters.searchQuery = req.query.searchQuery;
                }
                logger_1.default.debug("Fetching approved doctors");
                const { doctors, total } = yield this._doctorService.getApprovedDoctors(page, limit, filters);
                logger_1.default.info(`Fetched approved doctors`);
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, {
                    data: doctors,
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    }
                }));
            }
            catch (error) {
                logger_1.default.error("Error fetching approved doctors", { error });
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)("Internal server error"));
            }
        });
    }
    sendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                logger_1.default.debug(`Sending OTP to ${email}`);
                const result = yield this._doctorService.sendOtp(email);
                logger_1.default.info(`OTP sent to ${email}`);
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, result));
            }
            catch (error) {
                logger_1.default.error(`OTP send failed for ${req.body.email}`, { error: error.message });
                res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                logger_1.default.debug(`Verifying OTP for ${email}`);
                const result = yield this._doctorService.verifyOtp(email, otp);
                const { accessToken, refreshToken, id } = result;
                logger_1.default.info(`OTP verified for ${email}, setting cookies`);
                res.cookie("DoctorToken", accessToken, {
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
                res.status(httptatus_1.HttpStatus.OK).json({ id, accessToken, refreshToken });
            }
            catch (error) {
                logger_1.default.error(`OTP verification failed for ${req.body.email}`, { error: error.message });
                res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    resendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                logger_1.default.debug(`Resending OTP to ${email}`);
                const response = yield this._doctorService.resendOtp(email);
                logger_1.default.info(`OTP resent to ${email}`);
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
            }
            catch (error) {
                logger_1.default.error(`OTP resend failed for ${req.body.email}`, { error: error.message });
                res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    logger_1.default.warn("Google auth attempted without email");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.EMAIL_REQUIRED));
                }
                logger_1.default.debug(`Processing Google auth for ${email}`);
                yield this._doctorService.googleAuth(email);
                logger_1.default.info(`Google auth OTP sent to ${email}`);
                res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OTP_SENT));
            }
            catch (error) {
                logger_1.default.error("Google auth failed", { error: error.message });
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    updateDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctorId = req.params.doctorId;
                if (!doctorId) {
                    logger_1.default.warn("Update attempted without doctorId");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                logger_1.default.debug(`Updating doctor ${doctorId}`);
                const updatedDoctor = yield this._doctorService.updateData(doctorId, req.body, req.file);
                if (updatedDoctor) {
                    logger_1.default.info(`Doctor ${doctorId} updated successfully`);
                    res.status(httptatus_1.HttpStatus.OK).json(updatedDoctor);
                }
                else {
                    logger_1.default.warn(`Doctor not found for update: ${doctorId}`);
                    res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.NOT_FOUND));
                }
            }
            catch (error) {
                logger_1.default.error(`Error updating doctor ${req.params.doctorId}`, { error: error.message });
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error.message));
            }
        });
    }
    getDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctorId = req.params.doctorId;
                if (!doctorId) {
                    logger_1.default.warn("Doctor fetch attempted without ID");
                    return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                logger_1.default.debug(`Fetching doctor ${doctorId}`);
                const doctor = yield this._doctorService.getDoctor(doctorId);
                if (doctor) {
                    logger_1.default.info(`Doctor ${doctorId} fetched successfully`);
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, doctor));
                }
                else {
                    logger_1.default.warn(`Doctor not found: ${doctorId}`);
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
                }
            }
            catch (error) {
                logger_1.default.error(`Error fetching doctor ${req.params.doctorId}`, { error: error.message });
                res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    logger_1.default.warn("Refresh token missing");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)("Refresh Token missing"));
                }
                const secretKey = process.env.JWT_REFRESH_SECRET;
                if (!secretKey) {
                    logger_1.default.error("JWT refresh secret missing");
                    return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)("Server error: missing secret key"));
                }
                jsonwebtoken_1.default.verify(refreshToken, secretKey, (err, decoded) => {
                    if (err) {
                        logger_1.default.warn("Invalid refresh token");
                        return res.status(httptatus_1.HttpStatus.FORBIDDEN).json((0, types_2.errorResponse)("Invalid refresh token"));
                    }
                    if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id) || !(decoded === null || decoded === void 0 ? void 0 : decoded.email) || !(decoded === null || decoded === void 0 ? void 0 : decoded.role)) {
                        logger_1.default.warn("Invalid token payload", { decoded });
                        return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)("Invalid token payload"));
                    }
                    logger_1.default.debug(`Generating new access token for ${decoded.email}`);
                    const newAccessToken = (0, jwtHelper_1.generateAccessToken)(decoded.id, decoded.email, decoded.role);
                    return res.status(httptatus_1.HttpStatus.OK).json({ accessToken: newAccessToken });
                });
            }
            catch (error) {
                logger_1.default.error("Refresh token error", { error: error.message });
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(error.message));
            }
        });
    }
    getSingleDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!id) {
                    logger_1.default.warn("Id is  missing");
                    return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                const doctor = yield this._doctorService.getDoctor(id);
                logger_1.default.info("Doctor data fetched successfully", doctor);
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, doctor));
            }
            catch (error) {
                logger_1.default.error("Server error", error.message);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
};
DoctorController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.DoctorService)),
    __metadata("design:paramtypes", [Object])
], DoctorController);
exports.default = DoctorController;
