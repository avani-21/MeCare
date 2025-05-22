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
exports.SlotService = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const logger_1 = __importDefault(require("../utils/logger"));
let SlotService = class SlotService {
    constructor(_slotRepository) {
        this._slotRepository = _slotRepository;
    }
    getAllSlotsByDoctor(doctorId, page, limit) {
        throw new Error("Method not implemented.");
    }
    generateRecurringSlots(recurringData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate input
                if (!recurringData.doctorId || !recurringData.startDate || !recurringData.endDate ||
                    !recurringData.startTime || !recurringData.endTime || !recurringData.frequency) {
                    throw new Error("Missing required fields for recurring slots");
                }
                if (recurringData.startDate >= recurringData.endDate) {
                    throw new Error("End date must be after start date");
                }
                if (recurringData.frequency === 'WEEKLY' && (!recurringData.weekdays || recurringData.weekdays.length === 0)) {
                    throw new Error("Weekdays must be specified for weekly frequency");
                }
                return yield this._slotRepository.generateRecurringSlots(recurringData);
            }
            catch (error) {
                logger_1.default.error("Failed to generate recurring slots: " + error.message);
                throw error;
            }
        });
    }
    generateSlots(slotsData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._slotRepository.generateSlots(slotsData);
            }
            catch (error) {
                logger_1.default.error("Failed to create slots");
                throw new Error("Failed to create slots");
            }
        });
    }
    createSlot(slotData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._slotRepository.createSlot(slotData);
        });
    }
    getSlotsByDoctor(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const slots = yield this._slotRepository.findSlotByDoctor(doctorId);
                if (!slots || slots.length === 0) {
                    logger_1.default.warn(`No slots found for doctor ${doctorId}`);
                    throw new Error("No slots found");
                }
                const upcomingSlots = slots.filter(slot => {
                    const slotDate = new Date(slot.date);
                    return slotDate > today;
                });
                if (upcomingSlots.length === 0) {
                    logger_1.default.warn(`No upcoming slots found for doctor ${doctorId}`);
                    throw new Error("No upcoming slots available");
                }
                logger_1.default.info(`Fetched ${upcomingSlots.length} upcoming slots for doctor ${doctorId}`);
                return upcomingSlots;
            }
            catch (error) {
                logger_1.default.error("Failed to fetch slots", error);
                throw new Error("Failed to fetch slots");
            }
        });
    }
    checkSlotAvailability(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this._slotRepository.findById(slotId);
            if (!slot || slot.isBooked || !slot.isAvailable) {
                return false;
            }
            return true;
        });
    }
    getAllSlotByDoctor(doctorId, page, limit, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const slots = yield this._slotRepository.getAllSlotsByDoctor(doctorId, page, limit, startDate, endDate);
            console.log("slots", slots);
            return slots;
        });
    }
    editSlot(slotId, slotData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._slotRepository.editSlot(slotId, slotData);
        });
    }
    cancelSlot(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._slotRepository.cancelSlot(slotId);
        });
    }
};
exports.SlotService = SlotService;
exports.SlotService = SlotService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.SlotRepository)),
    __metadata("design:paramtypes", [Object])
], SlotService);
