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
exports.AdminDoctorRepository = void 0;
const inversify_1 = require("inversify");
const doctorModel_1 = __importDefault(require("../models/doctor/doctorModel"));
const patientModel_1 = __importDefault(require("../models/patient/patientModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const slotModel_1 = __importDefault(require("../models/slot/slotModel"));
let AdminDoctorRepository = class AdminDoctorRepository {
    createDoctor(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const newDoctor = new doctorModel_1.default(data);
            return yield newDoctor.save();
        });
    }
    saveSlots(doctorId, slots) {
        return __awaiter(this, void 0, void 0, function* () {
            const formattedSlots = slots.map(slot => (Object.assign(Object.assign({}, slot), { date: new Date(slot.date), doctorId: new mongoose_1.default.Types.ObjectId(doctorId) })));
            yield slotModel_1.default.insertMany(formattedSlots);
        });
    }
    findDoctorByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.default.findOne({ email });
        });
    }
    findDoctorByID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.default.findById(id);
        });
    }
    updateDoctor(id, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.default.findByIdAndUpdate(id, update, { new: true }); // Update doctor
        });
    }
    toggleDoctorApproval(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield doctorModel_1.default.findById(id);
            if (!doctor) {
                return null;
            }
            doctor.isApproved = !doctor.isApproved;
            return yield doctor.save();
        });
    }
    getPatient() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const [patients, total] = yield Promise.all([
                patientModel_1.default.find().skip(skip).limit(limit),
                patientModel_1.default.countDocuments()
            ]);
            return { patients, total };
        });
    }
    findAllDoctors() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, filters) {
            const skip = (page - 1) * limit;
            const query = {};
            if (filters.specialization) {
                query.specialization = {
                    $regex: `^${filters.specialization}$`,
                    $options: 'i'
                };
            }
            const [doctors, total] = yield Promise.all([
                doctorModel_1.default.find(query).skip(skip).limit(limit).lean(),
                doctorModel_1.default.countDocuments(query)
            ]);
            return { doctors, total };
        });
    }
};
exports.AdminDoctorRepository = AdminDoctorRepository;
exports.AdminDoctorRepository = AdminDoctorRepository = __decorate([
    (0, inversify_1.injectable)()
], AdminDoctorRepository);
