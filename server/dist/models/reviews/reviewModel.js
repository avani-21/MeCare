"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema_1 = __importDefault(require("./reviewSchema"));
const ReviewModel = mongoose_1.default.model('Review', reviewSchema_1.default);
exports.default = ReviewModel;
