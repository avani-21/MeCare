"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateAccessToken = (id, email, role) => {
    if (!process.env.JWT_SECRET)
        throw new Error("JWT_SECRET missing");
    console.log("Generating token with payload:", { id, email, role });
    const token = jsonwebtoken_1.default.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: "15d" });
    return token;
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (id, email, role) => {
    if (!process.env.JWT_REFRESH_SECRET)
        throw new Error("JWT_REFRESH_SECRET missing");
    return jsonwebtoken_1.default.sign({ id, email, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "17d" });
};
exports.generateRefreshToken = generateRefreshToken;
