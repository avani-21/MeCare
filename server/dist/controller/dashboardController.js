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
exports.DashboardController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const httptatus_1 = require("../utils/httptatus");
const message_1 = require("../utils/message");
const types_2 = require("../types/types");
const logger_1 = __importDefault(require("../utils/logger"));
let DashboardController = class DashboardController {
    constructor(_adminDashboardService, _doctorDashboardService) {
        this._adminDashboardService = _adminDashboardService;
        this._doctorDashboardService = _doctorDashboardService;
    }
    getDashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield this._adminDashboardService.getAdminDashboard();
                if (response) {
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
                }
                return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)(message_1.StatusMessages.NOT_FOUND));
            }
            catch (error) {
                logger_1.default.error("Error occurred getting data for admin dashboard", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    getDoctorDashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctorId = req.params.id;
                if (!doctorId) {
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)("Doctor ID is required"));
                }
                const dashboardData = yield this._doctorDashboardService.getDoctorDashboard(doctorId);
                if (dashboardData) {
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, dashboardData));
                }
                return res.status(httptatus_1.HttpStatus.NOT_FOUND).json((0, types_2.errorResponse)("No dashboard data found for this doctor"));
            }
            catch (error) {
                logger_1.default.error("Error occurred getting doctor dashboard data", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    getProfitDataForAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const range = req.query.range;
                if (range === 'custom') {
                    const startDate = new Date(req.query.startDate);
                    const endDate = new Date(req.query.endDate);
                    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        throw new Error('Invalid custom date range');
                    }
                    const data = yield this._adminDashboardService.getCustomProfitData({ startDate, endDate });
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, data));
                }
                else {
                    const data = yield this._adminDashboardService.getProfitData(range);
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, data));
                }
            }
            catch (error) {
                logger_1.default.error("Error fetching profit data", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
};
exports.DashboardController = DashboardController;
exports.DashboardController = DashboardController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.AdminDashboardService)),
    __param(1, (0, inversify_1.inject)(types_1.default.DoctorDashboardService)),
    __metadata("design:paramtypes", [Object, Object])
], DashboardController);
