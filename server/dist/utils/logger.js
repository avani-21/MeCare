"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const path_1 = __importDefault(require("path"));
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
}));
const coloredConsoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), logFormat);
const fileRotateTransport = new winston_1.default.transports.DailyRotateFile({
    filename: path_1.default.join(__dirname, "../logs/%DATE%.log"),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '7d',
    level: 'info',
    format: logFormat
});
const logger = winston_1.default.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston_1.default.transports.Console({
            format: coloredConsoleFormat,
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
        }),
        fileRotateTransport
    ]
});
exports.default = logger;
