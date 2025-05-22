"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const httptatus_1 = require("../utils/httptatus");
dotenv_1.default.config();
const authenticateDoctor = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json({ error: "Access Denied. No token provided." });
            return;
        }
        const token = authHeader.split(" ")[1];
        const secretKey = process.env.JWT_SECRET;
        jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json({ error: "Access Token Expired. Please refresh your token." });
                return;
            }
            if (!decoded || decoded.role !== "doctor") {
                console.log("role", decoded);
                res.status(httptatus_1.HttpStatus.FORBIDDEN).json({ error: "Forbidden. Unauthorized role." });
                return;
            }
            req.user = decoded;
            next();
        });
    }
    catch (error) {
        res.status(httptatus_1.HttpStatus.BAD_REQUEST).json({ error: "Invalid token." });
    }
};
exports.default = authenticateDoctor;
