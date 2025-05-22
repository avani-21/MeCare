"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// morganMiddleware.ts
const logger_1 = __importDefault(require("../utils/logger"));
const morgan_1 = __importDefault(require("morgan"));
const stream = {
    write: (message) => logger_1.default.http(message.trim())
};
const skip = () => process.env.NODE_ENV === 'test'; // Skip during tests
const morganMiddleware = (0, morgan_1.default)(':method :url :status :response-time ms - :res[content-length]', { stream, skip });
exports.default = morganMiddleware;
