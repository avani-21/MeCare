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
exports.AppointmentRepo = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const appointmentModel_1 = __importDefault(require("../models/appointment/appointmentModel"));
const stripe_1 = require("../config/stripe");
const mongoose_1 = require("mongoose");
const date_fns_1 = require("date-fns");
const patientModel_1 = __importDefault(require("../models/patient/patientModel"));
let AppointmentRepo = class AppointmentRepo {
    constructor(appointmentModel, prescriptionModel, doctorModel, patientModel) {
        this.appointmentModel = appointmentModel;
        this.prescriptionModel = prescriptionModel;
        this.doctorModel = doctorModel;
        this.patientModel = patientModel;
    }
    getPrescriptionForDoctor(AppointmentId) {
        throw new Error("Method not implemented.");
    }
    createAppointment(appointmentData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("test");
            const appointment = yield this.appointmentModel.create(appointmentData);
            console.log("New appointment", appointment);
            return appointment;
        });
    }
    getSingleAppointment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let appointment = yield this.appointmentModel.findById(id).populate("doctorId");
            if (!appointment) {
                throw new Error("No appointment data");
            }
            return appointment;
        });
    }
    createCheckoutSession(amount, doctorName, appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield stripe_1.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: `Appointment with Dr. ${doctorName}`,
                            },
                            unit_amount: amount * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.CLIENT_URL}/success`,
                cancel_url: `${process.env.CLIENT_URL}/cancel`,
                metadata: {
                    appointmentId,
                },
            });
            console.log("checkout", session);
            return { sessionId: session.id };
        });
    }
    updatePaymentStatus(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(appointmentModel_1.default.findByIdAndUpdate(appointmentId, {
                paymentStatus: 'paid',
                status: "booked",
            }));
            yield appointmentModel_1.default.findByIdAndUpdate(appointmentId, {
                paymentStatus: 'paid',
                status: "booked",
            });
        });
    }
    getPatientAppointment(id_1) {
        return __awaiter(this, arguments, void 0, function* (id, page = 1, limit = 10, filterStatus = "all") {
            const skip = (page - 1) * limit;
            const objectId = new mongoose_1.Types.ObjectId(id);
            const query = { patientId: objectId };
            if (filterStatus !== "all") {
                query.status = filterStatus;
            }
            let [appointment, total] = yield Promise.all([
                appointmentModel_1.default.find(query)
                    .skip(skip)
                    .limit(limit)
                    .populate("doctorId")
                    .sort({ createdAt: -1 })
                    .exec(),
                appointmentModel_1.default.countDocuments(query)
            ]);
            return { appointment, total };
        });
    }
    getDoctorAppointment(doctorId_1) {
        return __awaiter(this, arguments, void 0, function* (doctorId, page = 1, limit = 5, status = 'all', startDate, endDate, searchQuery) {
            const skip = (page - 1) * limit;
            const query = { doctorId };
            if (status !== 'all') {
                query.status = status;
            }
            // Date range filter
            if (startDate && endDate) {
                query.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            else if (startDate) {
                query.date = { $gte: new Date(startDate) };
            }
            else if (endDate) {
                query.date = { $lte: new Date(endDate) };
            }
            if (searchQuery && searchQuery.trim() !== '') {
                const searchRegex = new RegExp(searchQuery, "i");
                const patientQuery = {
                    $or: [
                        { name: searchRegex },
                        { email: searchRegex }
                    ]
                };
                const matchingPatients = yield patientModel_1.default.find(patientQuery).select('_id').lean();
                const patientIds = matchingPatients.map(p => p._id);
                query.$or = [
                    { patientId: { $in: patientIds } },
                    { appointmentId: searchRegex }
                ];
            }
            const [appointments, total] = yield Promise.all([
                appointmentModel_1.default.find(query)
                    .skip(skip)
                    .limit(limit)
                    .populate({
                    path: 'patientId',
                })
                    .sort({ createdAt: -1 })
                    .lean()
                    .exec(),
                appointmentModel_1.default.countDocuments(query)
            ]);
            return {
                appointments: appointments.length > 0 ? appointments : null,
                total
            };
        });
    }
    getAllAppointment() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            let response = yield appointmentModel_1.default.find().populate("patientId").populate("doctorId").sort({ createdAt: -1 }).exec();
            return response;
        });
    }
    changeAppointmentStatus(appointmentId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            let appointment = yield this.appointmentModel.findByIdAndUpdate(appointmentId, { status: status }, { new: true });
            return appointment;
        });
    }
    createPrescription(prescriptionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const prescription = yield this.prescriptionModel.create({
                appointmentId: new mongoose_1.Types.ObjectId(prescriptionData.appointmentId),
                doctorId: new mongoose_1.Types.ObjectId(prescriptionData.doctorId),
                patientId: new mongoose_1.Types.ObjectId(prescriptionData.patientId),
                diagnosis: prescriptionData.diagnosis,
                medications: prescriptionData.medications,
                instructions: prescriptionData.instructions
            });
            yield this.appointmentModel.findByIdAndUpdate(prescriptionData.appointmentId, { $set: {
                    prescriptionId: prescription._id
                } }, { new: true });
            return prescription;
        });
    }
    getPrescription(AppointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prescriptionModel.find({ appointmentId: AppointmentId }).populate("appointmentId").populate("patientId").populate("doctorId").exec();
        });
    }
    getTotalAppointment() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield appointmentModel_1.default.find({ paymentStatus: "paid" }).countDocuments();
        });
    }
    getAllAppointments() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.appointmentModel.find()
                .populate("doctorId")
                .exec();
        });
    }
    getLatestAppointment() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield appointmentModel_1.default.find().sort({ createdAt: -1 }).limit(10).populate("doctorId").populate("patientId");
        });
    }
    getTotalDoctorsAppointments(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield appointmentModel_1.default.find({ doctorId: doctorId }).countDocuments();
        });
    }
    getCounsulterAppointments(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield appointmentModel_1.default.countDocuments({
                doctorId: doctorId,
                status: 'completed'
            });
            console.log("dfjdf", count);
            return count;
        });
    }
    getTodaysAppointments(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            let today = new Date();
            today.setHours(0, 0, 0, 0);
            const appointments = yield appointmentModel_1.default.find({ doctorId: doctorId, date: { $gte: today } }).sort({ createdAt: -1 }).limit(5).populate("doctorId").populate("patientId").exec();
            return appointments.length > 0 ? { appointments, count: appointments.length } : null;
        });
    }
    getProfitData(range) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            let startDate, endDate, intervalDates, dateFormat;
            switch (range) {
                case 'weekly':
                    startDate = (0, date_fns_1.startOfWeek)(now);
                    endDate = (0, date_fns_1.endOfWeek)(now);
                    intervalDates = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate });
                    dateFormat = 'EEE';
                    break;
                case 'monthly':
                    startDate = (0, date_fns_1.startOfMonth)(now);
                    endDate = (0, date_fns_1.endOfMonth)(now);
                    intervalDates = (0, date_fns_1.eachWeekOfInterval)({ start: startDate, end: endDate });
                    dateFormat = 'MMM dd';
                    break;
                case 'yearly':
                    startDate = (0, date_fns_1.startOfYear)(now);
                    endDate = (0, date_fns_1.endOfYear)(now);
                    intervalDates = (0, date_fns_1.eachMonthOfInterval)({ start: startDate, end: endDate });
                    dateFormat = 'MMM';
                    break;
                default:
                    throw new Error('Invalid time range');
            }
            const appointments = yield appointmentModel_1.default.find({
                date: { $gte: startDate, $lte: endDate },
                paymentStatus: 'paid'
            }).populate({
                path: 'doctorId',
                select: 'consultantFee'
            });
            const labels = intervalDates.map(date => (0, date_fns_1.format)(date, dateFormat));
            const data = intervalDates.map(date => {
                const filteredAppointments = appointments.filter(appointment => {
                    const appointmentDate = appointment.date;
                    if (range === 'weekly') {
                        return (appointmentDate.getDate() === date.getDate() &&
                            appointmentDate.getMonth() === date.getMonth() &&
                            appointmentDate.getFullYear() === date.getFullYear());
                    }
                    else if (range === 'monthly') {
                        const weekEnd = new Date(date);
                        weekEnd.setDate(date.getDate() + 6);
                        return appointmentDate >= date && appointmentDate <= weekEnd;
                    }
                    else {
                        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                        return appointmentDate >= date && appointmentDate <= monthEnd;
                    }
                });
                return filteredAppointments.reduce((sum, appointment) => {
                    let profit = 0;
                    profit += 120;
                    if (appointment.status === 'completed' && appointment.doctorId) {
                        const consultantFee = appointment.doctorId.consultantFee || 0;
                        profit += consultantFee;
                    }
                    return sum + profit;
                }, 0);
            });
            const total = data.reduce((sum, val) => sum + val, 0);
            return { labels, data, total };
        });
    }
    getCustomProfitData(dateRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startDate, endDate } = dateRange;
            // Determine the best interval based on date range span
            const diffInDays = (0, date_fns_1.differenceInDays)(endDate, startDate);
            let intervalDates;
            let dateFormat;
            if (diffInDays <= 7) {
                // Daily intervals for short ranges (< 1 week)
                intervalDates = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate });
                dateFormat = 'EEE, MMM dd';
            }
            else if (diffInDays <= 31) {
                // Weekly intervals for medium ranges (< 1 month)
                intervalDates = (0, date_fns_1.eachWeekOfInterval)({ start: startDate, end: endDate });
                dateFormat = 'MMM dd';
            }
            else {
                // Monthly intervals for long ranges (> 1 month)
                intervalDates = (0, date_fns_1.eachMonthOfInterval)({ start: startDate, end: endDate });
                dateFormat = 'MMM yyyy';
            }
            // Fetch paid appointments in the given range
            const appointments = yield appointmentModel_1.default.find({
                date: { $gte: startDate, $lte: endDate },
                paymentStatus: 'paid'
            }).populate({
                path: 'doctorId',
                select: 'consultantFee'
            });
            // Generate labels and calculate profit (same logic as before)
            const labels = intervalDates.map(date => (0, date_fns_1.format)(date, dateFormat));
            const data = intervalDates.map(date => {
                const filteredAppointments = appointments.filter(appointment => {
                    const appointmentDate = appointment.date;
                    if (diffInDays <= 7) {
                        // Daily filtering
                        return (appointmentDate.getDate() === date.getDate() &&
                            appointmentDate.getMonth() === date.getMonth() &&
                            appointmentDate.getFullYear() === date.getFullYear());
                    }
                    else if (diffInDays <= 31) {
                        // Weekly filtering
                        const weekEnd = new Date(date);
                        weekEnd.setDate(date.getDate() + 6);
                        return appointmentDate >= date && appointmentDate <= weekEnd;
                    }
                    else {
                        // Monthly filtering
                        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                        return appointmentDate >= date && appointmentDate <= monthEnd;
                    }
                });
                return filteredAppointments.reduce((sum, appointment) => {
                    let profit = 120; // Base fee
                    if (appointment.status === 'completed' && appointment.doctorId) {
                        profit += appointment.doctorId.consultantFee;
                    }
                    return sum + profit;
                }, 0);
            });
            const total = data.reduce((sum, val) => sum + val, 0);
            return { labels, data, total };
        });
    }
    getDoctorsByPatient(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctorIds = yield this.appointmentModel
                .distinct('doctorId', { patientId })
                .exec();
            if (!doctorIds.length)
                return null;
            const doctors = yield this.doctorModel.find({
                _id: { $in: doctorIds }
            }).exec();
            return doctors.length ? doctors : null;
        });
    }
    getPatientsByDoctors(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const patientIds = yield this.appointmentModel.distinct('patientId', { doctorId }).exec();
            if (!patientIds.length) {
                return null;
            }
            const patients = yield this.patientModel.find({
                _id: { $in: patientIds }
            }).exec();
            return patients;
        });
    }
};
exports.AppointmentRepo = AppointmentRepo;
exports.AppointmentRepo = AppointmentRepo = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.AppointmentModel)),
    __param(1, (0, inversify_1.inject)(types_1.default.PrescriptionModel)),
    __param(2, (0, inversify_1.inject)(types_1.default.DoctorModel)),
    __param(3, (0, inversify_1.inject)(types_1.default.PatientModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AppointmentRepo);
