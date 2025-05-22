"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ChatSchema = new mongoose_1.Schema({
    senderId: {
        type: String,
        required: true,
        index: true // Add index for faster queries
    },
    receiverId: {
        type: String,
        required: true,
        index: true // Add index for faster queries
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
exports.ChatSchema.index({ senderId: 1, receiverId: 1 });
exports.ChatSchema.index({ receiverId: 1, senderId: 1 });
exports.ChatSchema.index({ receiverId: 1, isRead: 1 });
