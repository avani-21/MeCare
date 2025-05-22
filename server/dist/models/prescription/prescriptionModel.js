"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const prescriptionSchema_1 = __importDefault(require("./prescriptionSchema"));
const PrescriptioModel = mongoose_1.default.model('Prescription', prescriptionSchema_1.default);
exports.default = PrescriptioModel;
