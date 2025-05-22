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
exports.SlotController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const logger_1 = __importDefault(require("../utils/logger"));
const httptatus_1 = require("../utils/httptatus");
const types_2 = require("../types/types");
const message_1 = require("../utils/message");
let SlotController = class SlotController {
    constructor(_slotService) {
        this._slotService = _slotService;
    }
    findSlotBydoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctorId = req.params.id;
                console.log(doctorId);
                if (!doctorId) {
                    logger_1.default.warn("Doctor id is missing");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                let result = yield this._slotService.getSlotsByDoctor(doctorId);
                console.log("ans", result);
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, result));
            }
            catch (error) {
                logger_1.default.error(error.message);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
    createSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctorId = req.params.id;
                const { date, startTime, endTime } = req.body;
                const slot = yield this._slotService.createSlot({
                    doctorId,
                    date,
                    startTime,
                    endTime
                });
                if (slot) {
                    return res.status(httptatus_1.HttpStatus.CREATED).json((0, types_2.successResponse)(message_1.StatusMessages.CREATED, slot));
                }
            }
            catch (error) {
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
    getAllSlotsOfDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctorId = req.params.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                // Parse date parameters if they exist
                let startDate;
                let endDate;
                if (req.query.startDate) {
                    startDate = new Date(req.query.startDate);
                    if (isNaN(startDate.getTime())) {
                        return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)("Invalid start date format"));
                    }
                }
                if (req.query.endDate) {
                    endDate = new Date(req.query.endDate);
                    if (isNaN(endDate.getTime())) {
                        return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)("Invalid end date format"));
                    }
                }
                // Validate date range if both are provided
                if (startDate && endDate && startDate > endDate) {
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)("Start date cannot be after end date"));
                }
                if (!doctorId) {
                    logger_1.default.warn("Doctor id is missing");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.BAD_REQUEST));
                }
                const response = yield this._slotService.getAllSlotByDoctor(doctorId, page, limit, startDate, endDate);
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
            }
            catch (error) {
                logger_1.default.error(error.message);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    editSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!doctorId) {
                    logger_1.default.warn("doctor id is missing");
                    return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                let slotId = req.params.id;
                if (!slotId) {
                    logger_1.default.warn("slot id is missing");
                    return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                const updatedSlots = yield this._slotService.editSlot(slotId, Object.assign({ doctorId }, req.body));
                if (updatedSlots) {
                    logger_1.default.info("Slot data updated successfully");
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, updatedSlots));
                }
            }
            catch (error) {
                logger_1.default.error("error updaing the slots");
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    cancelSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let slotId = req.params.id;
                if (!slotId) {
                    logger_1.default.warn("Slot id is missing");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                let response = yield this._slotService.cancelSlot(slotId);
                if (response) {
                    logger_1.default.info("Slot deletedd successfully");
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK));
                }
            }
            catch (error) {
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    createRecurringSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { startDate, endDate, startTime, endTime, frequency, interval, weekdays } = req.body;
                if (!doctorId || !startDate || !endDate || !startTime || !endTime || !frequency) {
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)("Missing required fields"));
                }
                const slots = yield this._slotService.generateRecurringSlots({
                    doctorId,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    startTime,
                    endTime,
                    frequency,
                    interval: interval || 1,
                    weekdays
                });
                return res.status(httptatus_1.HttpStatus.CREATED).json((0, types_2.successResponse)("Recurring slots created successfully", slots));
            }
            catch (error) {
                logger_1.default.error("Error creating recurring slots: " + error.message);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(error.message || "Failed to create recurring slots"));
            }
        });
    }
};
exports.SlotController = SlotController;
exports.SlotController = SlotController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.SlotService)),
    __metadata("design:paramtypes", [Object])
], SlotController);
