"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const doctorSchema_1 = __importDefault(require("./doctorSchema"));
const DoctorModel = mongoose_1.default.model("Doctor", doctorSchema_1.default);
exports.default = DoctorModel;
