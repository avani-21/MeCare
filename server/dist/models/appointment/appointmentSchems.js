"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const AppointmentSchema = new mongoose_1.Schema({
    slotId: {
        type: mongoose_2.default.Schema.Types.ObjectId,
        ref: "Slot",
        required: true,
    },
    appointmentId: {
        type: String,
    },
    doctorId: {
        type: mongoose_2.default.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    patientId: {
        type: mongoose_2.default.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['booked', 'completed', 'cancelled', "pending"],
        default: 'booked'
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "unpaid"],
        default: "unpaid"
    },
    amount: {
        type: Number,
        default: 120
    },
    reviewId: {
        type: mongoose_2.default.Schema.Types.ObjectId,
        ref: "Review",
    },
    prescriptionId: {
        type: mongoose_2.default.Schema.Types.ObjectId,
        ref: "Prescription",
    },
}, { timestamps: true });
exports.default = AppointmentSchema;
