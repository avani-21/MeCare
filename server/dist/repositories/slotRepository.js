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
exports.SlotRepository = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const mongoose_1 = require("mongoose");
const date_fns_1 = require("date-fns");
const slotModel_1 = __importDefault(require("../models/slot/slotModel"));
const baseRepositry_1 = require("./baseRepositry");
const mongoose_2 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const rrule_1 = require("rrule");
let SlotRepository = class SlotRepository extends baseRepositry_1.BaseRepository {
    constructor(slotModel) {
        super(slotModel);
    }
    generateSlots(slotsData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const insertedSlots = yield slotModel_1.default.insertMany(slotsData);
                return insertedSlots;
            }
            catch (error) {
                console.error('Error generating slots:', error);
                throw new Error('Failed to generate slots');
            }
        });
    }
    createSlot(slotData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { doctorId, date, startTime, endTime } = slotData;
            if (!doctorId || !date || !startTime || !endTime) {
                throw new Error("All fields are required");
            }
            const slotDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            slotDate.setHours(0, 0, 0, 0);
            if (slotDate.getTime() === today.getTime()) {
                const now = new Date();
                const [startHour, startMinute] = startTime.split(':').map(Number);
                const slotStartDateTime = new Date(date);
                slotStartDateTime.setHours(startHour, startMinute, 0, 0);
                if (slotStartDateTime <= now) {
                    throw new Error("Start time must be greater than the current time");
                }
            }
            const existingSlot = yield slotModel_1.default.findOne({
                doctorId,
                date,
                $or: [
                    { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
                    { startTime, endTime }
                ]
            });
            if (existingSlot) {
                throw new Error("The doctor already has a slot at the given date and time");
            }
            return yield slotModel_1.default.create(slotData);
        });
    }
    findSlotByDoctor(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const slots = yield slotModel_1.default.find({
                    doctorId: new mongoose_2.default.Types.ObjectId(doctorId), // Use parameter, not hardcoded value
                    isBooked: false
                })
                    .populate('doctorId')
                    .sort({ startTime: 1 })
                    .exec(); // Don't forget to execute the query
                console.log("Found slots:", slots);
                return slots;
            }
            catch (error) {
                console.error('Error finding slots:', error);
                throw error;
            }
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slotModel_1.default.findById(id);
        });
    }
    markSlotAsBooked(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield slotModel_1.default.findByIdAndUpdate(slotId, { isBooked: true, isAvailable: false }, { new: true });
            }
            catch (error) {
                console.error('Error marking slot as booked:', error);
                throw new Error('Failed to update slot booking status');
            }
        });
    }
    getAllSlotsByDoctor(doctorId_1) {
        return __awaiter(this, arguments, void 0, function* (doctorId, page = 1, limit = 10, startDate, endDate) {
            const skip = (page - 1) * limit;
            const baseQuery = { doctorId: doctorId };
            if (startDate && endDate) {
                baseQuery.date = {
                    $gte: (0, date_fns_1.startOfDay)(startDate),
                    $lte: (0, date_fns_1.endOfDay)(endDate)
                };
            }
            else if (startDate) {
                baseQuery.date = {
                    $gte: (0, date_fns_1.startOfDay)(startDate)
                };
            }
            else {
                baseQuery.date = {
                    $gte: (0, date_fns_1.startOfDay)(new Date())
                };
            }
            const [slots, total] = yield Promise.all([
                slotModel_1.default.find(baseQuery)
                    .sort({ date: 1 })
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                slotModel_1.default.countDocuments(baseQuery)
            ]);
            return { slots, total };
        });
    }
    editSlot(slotId, slotData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedSlots = yield slotModel_1.default.findByIdAndUpdate(slotId, { $set: slotData }, { new: true });
            if (!updatedSlots) {
                logger_1.default.error("Slot not fount");
                throw new Error("Slot not found");
            }
            return updatedSlots;
        });
    }
    cancelSlot(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cancelSlot = yield slotModel_1.default.findByIdAndDelete(slotId);
            if (!cancelSlot) {
                logger_1.default.error("Slot not fount");
                throw new Error("Slot not fount");
            }
            return cancelSlot;
        });
    }
    generateRecurringSlots(recurringData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { doctorId, startDate, endDate, startTime, endTime, frequency, interval, weekdays } = recurringData;
                if (!doctorId || !startDate || !endDate || !startTime || !endTime) {
                    throw new Error("All fields are required");
                }
                const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
                    throw new Error("Invalid time format. Use HH:MM");
                }
                if (startTime >= endTime) {
                    throw new Error("End time must be after start time");
                }
                let freq;
                switch (frequency) {
                    case 'DAILY':
                        freq = rrule_1.RRule.DAILY;
                        break;
                    case 'WEEKLY':
                        freq = rrule_1.RRule.WEEKLY;
                        break;
                    case 'MONTHLY':
                        freq = rrule_1.RRule.MONTHLY;
                        break;
                    default:
                        throw new Error('Invalid frequency');
                }
                const byweekday = weekdays === null || weekdays === void 0 ? void 0 : weekdays.map(day => {
                    switch (day) {
                        case 0: return rrule_1.RRule.SU;
                        case 1: return rrule_1.RRule.MO;
                        case 2: return rrule_1.RRule.TU;
                        case 3: return rrule_1.RRule.WE;
                        case 4: return rrule_1.RRule.TH;
                        case 5: return rrule_1.RRule.FR;
                        case 6: return rrule_1.RRule.SA;
                        default: return rrule_1.RRule.MO;
                    }
                });
                const normalizeDate = (date) => {
                    const d = new Date(date);
                    d.setHours(12, 0, 0, 0);
                    return d;
                };
                const rule = new rrule_1.RRule({
                    freq,
                    dtstart: normalizeDate(startDate),
                    until: normalizeDate(endDate),
                    interval,
                    byweekday: frequency === 'WEEKLY' ? byweekday : undefined
                });
                const dates = rule.all();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const pastDates = dates.filter(date => {
                    const slotDate = new Date(date);
                    slotDate.setHours(0, 0, 0, 0);
                    return slotDate < today;
                });
                if (pastDates.length > 0) {
                    throw new Error("Cannot create slots for past dates");
                }
                const now = new Date();
                const todaySlots = dates.filter(date => {
                    const slotDate = new Date(date);
                    slotDate.setHours(0, 0, 0, 0);
                    return slotDate.getTime() === today.getTime();
                });
                if (todaySlots.length > 0) {
                    const [startHour, startMinute] = startTime.split(':').map(Number);
                    const slotStartDateTime = new Date(today);
                    slotStartDateTime.setHours(startHour, startMinute, 0, 0);
                    if (slotStartDateTime <= now) {
                        throw new Error("Start time must be greater than the current time for today's slots");
                    }
                }
                const slotsToCreate = dates.map(date => {
                    const slotDate = new Date(date);
                    slotDate.setHours(0, 0, 0, 0);
                    return {
                        doctorId,
                        date: slotDate,
                        startTime,
                        endTime,
                        isBooked: false,
                        isAvailable: true
                    };
                });
                const BATCH_SIZE = 50;
                const conflictingSlots = [];
                for (let i = 0; i < slotsToCreate.length; i += BATCH_SIZE) {
                    const batch = slotsToCreate.slice(i, i + BATCH_SIZE);
                    const existingSlots = yield slotModel_1.default.find({
                        doctorId,
                        $or: batch.map(slot => ({
                            date: slot.date,
                            $or: [
                                { startTime: { $lt: slot.endTime }, endTime: { $gt: slot.startTime } },
                                { startTime: slot.startTime, endTime: slot.endTime }
                            ]
                        }))
                    });
                    existingSlots.forEach(slot => {
                        conflictingSlots.push({
                            date: slot.date.toISOString().split('T')[0],
                            startTime: slot.startTime,
                            endTime: slot.endTime
                        });
                    });
                }
                if (conflictingSlots.length > 0) {
                    const conflictMessage = conflictingSlots
                        .map(s => `${s.date} (${s.startTime}-${s.endTime})`)
                        .join(', ');
                    throw new Error(`Conflicting slots found: ${conflictMessage}`);
                }
                const insertedSlots = [];
                for (let i = 0; i < slotsToCreate.length; i += BATCH_SIZE) {
                    const batch = slotsToCreate.slice(i, i + BATCH_SIZE);
                    const results = yield slotModel_1.default.insertMany(batch);
                    insertedSlots.push(...results);
                }
                return insertedSlots;
            }
            catch (error) {
                logger_1.default.error('Error generating recurring slots:', error);
                throw new Error(error instanceof Error ? error.message : 'Failed to generate recurring slots');
            }
        });
    }
};
exports.SlotRepository = SlotRepository;
exports.SlotRepository = SlotRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.SlotModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], SlotRepository);
