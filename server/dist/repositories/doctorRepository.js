"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.DoctorRepository = void 0;
const inversify_1 = require("inversify");
const doctorModel_1 = __importDefault(require("../models/doctor/doctorModel"));
let DoctorRepository = class DoctorRepository {
    findDoctor(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.default.findOne({ email });
        });
    }
    updateOtp(email, otp, otpExpiration) {
        return __awaiter(this, void 0, void 0, function* () {
            yield doctorModel_1.default.findOneAndUpdate({ email }, { otp, otpExpiration }, { new: true });
        });
    }
    verifyDoctor(email) {
        return __awaiter(this, void 0, void 0, function* () {
            yield doctorModel_1.default.findOneAndUpdate({ email }, { isVerified: true, otp: null, otpExpiration: null }, { new: true });
        });
    }
    updateDoctor(doctorId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.default.findByIdAndUpdate(doctorId, updateData, { new: true });
        });
    }
    getDoctorById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.default.findById(id);
        });
    }
    getApprovedDoctors() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 3, filters) {
            const skip = (page - 1) * limit;
            const query = {
                isApproved: true
            };
            if (filters.specialization) {
                query.specialization = {
                    $regex: filters.specialization,
                    $options: 'i'
                };
            }
            if (filters.gender) {
                query.gender = filters.gender;
            }
            if (filters.experience) {
                query.experience = { $gte: filters.experience };
            }
            if (filters.searchQuery) {
                const searchRegex = new RegExp(filters.searchQuery, 'i');
                query.$or = [
                    { city: { $regex: searchRegex } },
                    { street: { $regex: searchRegex } },
                    { state: { $regex: searchRegex } },
                    { fullName: { $regex: searchRegex } }
                ];
            }
            const [doctors, total] = yield Promise.all([
                doctorModel_1.default.find(query)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                doctorModel_1.default.countDocuments(query)
            ]);
            return { doctors, total };
        });
    }
    getAllDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.default.find({ isApproved: true }).countDocuments();
        });
    }
};
exports.DoctorRepository = DoctorRepository;
exports.DoctorRepository = DoctorRepository = __decorate([
    (0, inversify_1.injectable)()
], DoctorRepository);
