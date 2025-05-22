"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const httptatus_1 = require("../utils/httptatus");
const patientModel_1 = __importDefault(require("../models/patient/patientModel")); // Import PatientModel
dotenv_1.default.config();
const authenticatePatient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = req.cookies.patientToken || ((_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
        if (!token) {
            res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json({
                error: 'Access Denied. No token provided.',
            });
            return;
        }
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json({
                    error: 'Access Token Expired. Please refresh your token.',
                    code: 'TOKEN_EXPIRED',
                });
            }
            if (decoded.role !== 'patient') {
                return res.status(httptatus_1.HttpStatus.FORBIDDEN).json({
                    error: 'Forbidden. Unauthorized role.',
                });
            }
            // Check if patient is blocked
            const patient = yield patientModel_1.default.findById(decoded.id);
            if (!patient) {
                return res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json({
                    error: 'Patient not found.',
                });
            }
            if (patient.isBlock) {
                return res.status(httptatus_1.HttpStatus.FORBIDDEN).json({
                    error: 'Account is blocked.',
                });
            }
            req.user = decoded;
            next();
        }));
    }
    catch (error) {
        res.status(httptatus_1.HttpStatus.BAD_REQUEST).json({
            error: 'Invalid token.',
        });
    }
});
exports.default = authenticatePatient;
