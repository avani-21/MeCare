"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const patientSchema = new mongoose_1.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String,
    },
    otpExpiration: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: null,
    },
    phone: {
        type: String,
        default: null
    },
    city: {
        type: String
    },
    street: {
        type: String
    },
    pincode: {
        type: String
    },
    dob: {
        type: Date
    },
    isBlock: {
        type: Boolean,
        default: false
    },
    age: {
        type: Number
    },
    profileImage: {
        type: String,
        default: "https://res.cloudinary.com/danyvuvkm/image/upload/v1742640347/vecteezy_default-profile-account-unknown-icon-black-silhouette_20765399_cdpbr4.jpg"
    }
}, { timestamps: true });
exports.default = patientSchema;
