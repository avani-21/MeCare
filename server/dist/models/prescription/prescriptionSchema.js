"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const medicationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        required: true,
    },
    dosage: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    }
});
const prescriptionSchema = new mongoose_1.Schema({
    appointmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Patient', required: true },
    diagnosis: { type: String, required: true },
    medications: [medicationSchema],
    instructions: { type: String, required: true },
}, { timestamps: true });
exports.default = prescriptionSchema;
