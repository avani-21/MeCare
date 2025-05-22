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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const mongoose_1 = __importDefault(require("mongoose"));
const types_1 = __importDefault(require("../di/types"));
const logger_1 = __importDefault(require("../utils/logger"));
let DocRegService = class DocRegService {
    constructor(doctorRepository, slotRepository) {
        this.doctorRepository = doctorRepository;
        this.slotRepository = slotRepository;
    }
    registerDoctor(doctorData, files) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Registering doctor with email: ${doctorData.email}`);
            const existingDoctor = yield this.doctorRepository.findDoctorByEmail(doctorData.email);
            if (existingDoctor) {
                logger_1.default.warn(`Doctor registration attempted with existing email: ${doctorData.email}`);
                throw new Error("Doctor with this email already exists");
            }
            const profileImgUrl = files.profileImg ? yield this.uploadToCloudinary(files.profileImg[0]) : null;
            const kycCertificateUrl = files.kycCertificate ? yield this.uploadToCloudinary(files.kycCertificate[0]) : null;
            if (!profileImgUrl) {
                throw new Error("Profile image is required!");
            }
            const { _id } = doctorData, data = __rest(doctorData, ["_id"]);
            const newDoctor = Object.assign(Object.assign({}, data), { _id: new mongoose_1.default.Types.ObjectId().toString(), profileImg: profileImgUrl, kycCertificate: kycCertificateUrl, isVerified: false, isApproved: false, createdAt: new Date(), reviewCount: 0, rating: 0 });
            logger_1.default.info("Doctor registered successfully");
            const createdDoctor = yield this.doctorRepository.createDoctor(newDoctor);
            return createdDoctor;
        });
    }
    uploadToCloudinary(file) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info("Adding image files to cloudinary");
            const result = yield cloudinary_config_1.default.uploader.upload(file.path);
            return result.secure_url;
        });
    }
    getDoctorByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info("Fetching doctor by Email", email);
            return yield this.doctorRepository.findDoctorByEmail(email);
        });
    }
    getAllDoctors() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, filters = {}) {
            logger_1.default.debug(`Fetching doctors - Page: ${page}, Limit: ${limit}, Filters: ${JSON.stringify(filters)}`);
            return yield this.doctorRepository.findAllDoctors(page, limit, filters);
        });
    }
    updateDoctor(id, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info("Updating doctor with Id:", id);
            return yield this.doctorRepository.updateDoctor(id, updatedData);
        });
    }
    toggleDoctorApproval(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info('Toggling approvel status of doctors:', id);
            return yield this.doctorRepository.toggleDoctorApproval(id);
        });
    }
    getPatient() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            logger_1.default.debug(`Fetching patients - Page: ${page}, Limit: ${limit}`);
            return yield this.doctorRepository.getPatient(page, limit);
        });
    }
};
DocRegService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.DoctorRegRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.SlotRepository)),
    __metadata("design:paramtypes", [Object, Object])
], DocRegService);
exports.default = DocRegService;
