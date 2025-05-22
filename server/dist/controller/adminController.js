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
exports.AdminController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const adminSrevice_1 = __importDefault(require("../services/adminSrevice"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtHelper_1 = require("../utils/jwtHelper");
const httptatus_1 = require("../utils/httptatus");
const types_2 = require("../types/types");
const logger_1 = __importDefault(require("../utils/logger"));
const message_1 = require("../utils/message");
let AdminController = class AdminController {
    constructor(adminService) {
        this._adminService = adminService;
    }
    adminLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                logger_1.default.http(`Admin login attempt: ${email}`);
                logger_1.default.debug(`Request body: ${JSON.stringify(req.body)}`);
                const { accessToken, refreshToken } = yield this._adminService.loginAdmin(email, password);
                logger_1.default.info("admin logged in successfully");
                res.cookie("adminToken", accessToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
                res.status(httptatus_1.HttpStatus.CREATED).json((0, types_2.successResponse)(message_1.StatusMessages.CREATED, { accessToken, refreshToken }));
            }
            catch (error) {
                res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json((0, types_2.errorResponse)(message_1.StatusMessages.UNAUTHORIZED, error.message));
            }
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    return res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json({
                        error: "Refresh token missing",
                        code: "REFRESH_TOKEN_MISSING",
                    });
                }
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                // Generate new tokens (optionally rotate refresh token)
                const newAccessToken = (0, jwtHelper_1.generateAccessToken)(decoded.id, decoded.email, "admin");
                const newRefreshToken = (0, jwtHelper_1.generateRefreshToken)(decoded.id, decoded.email, "admin");
                // Set new cookies
                res.cookie("adminToken", newAccessToken, {
                    httpOnly: false,
                    maxAge: 15 * 60 * 1000,
                });
                res.cookie("refreshToken", newRefreshToken, {
                    httpOnly: false,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
                return res.status(httptatus_1.HttpStatus.OK).json({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                });
            }
            catch (error) {
                if (error.name === "TokenExpiredError") {
                    return res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json({
                        error: "Refresh token expired",
                        code: "REFRESH_TOKEN_EXPIRED",
                    });
                }
                return res.status(httptatus_1.HttpStatus.FORBIDDEN).json({ error: "Invalid token." });
            }
        });
    }
    logOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("patientToken", {
                    httpOnly: true,
                    secure: false,
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
    togglePatientBlockStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let patientId = req.params.id;
                if (!patientId) {
                    logger_1.default.warn("Patient id is missing");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                let response = yield this._adminService.togglePatientStatus(patientId);
                if (response) {
                    logger_1.default.info("Status changged successfully");
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK));
                }
            }
            catch (error) {
                logger_1.default.warn("Error occured during the patient status toggle");
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
};
exports.AdminController = AdminController;
exports.AdminController = AdminController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.AdminService)),
    __metadata("design:paramtypes", [adminSrevice_1.default])
], AdminController);
