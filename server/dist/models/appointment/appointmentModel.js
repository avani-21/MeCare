"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appointmentSchems_1 = __importDefault(require("./appointmentSchems"));
const mongoose_1 = __importDefault(require("mongoose"));
const AppointmentModel = mongoose_1.default.model("Appointment", appointmentSchems_1.default);
exports.default = AppointmentModel;
