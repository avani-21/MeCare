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
const types_1 = __importDefault(require("../di/types"));
const jwtHelper_1 = require("../utils/jwtHelper");
const logger_1 = __importDefault(require("../utils/logger"));
let AdminService = class AdminService {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    loginAdmin(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Attempting admin login for email: ${email}`);
            const admin = yield this.adminRepository.findByEmail(email);
            if (!admin) {
                logger_1.default.warn(`Admin login failed - email not found: ${email}`);
                throw new Error("Admin not found");
            }
            const validPassword = yield bcrypt_1.default.compare(password, admin.password);
            if (!validPassword) {
                logger_1.default.warn(`Admin login failed - invalid password`);
                throw new Error("Invalid password");
            }
            const accessToken = (0, jwtHelper_1.generateAccessToken)(admin.id, admin.email, "admin");
            const refreshToken = (0, jwtHelper_1.generateRefreshToken)(admin.id, admin.email, "admin");
            logger_1.default.info(`Admin login successful for: ${email}`);
            return { accessToken, refreshToken };
        });
    }
    togglePatientStatus(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.adminRepository.togglePatientStatus(patientId);
        });
    }
};
AdminService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.AdminRepository)),
    __metadata("design:paramtypes", [Object])
], AdminService);
exports.default = AdminService;
