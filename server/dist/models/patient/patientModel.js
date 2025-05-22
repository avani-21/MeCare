"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const patientSchema_1 = __importDefault(require("./patientSchema"));
const PatientModel = mongoose_1.default.model("Patient", patientSchema_1.default);
exports.default = PatientModel;
