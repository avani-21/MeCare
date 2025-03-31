import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";


const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};


winston.addColors(colors);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const coloredConsoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }), 
  logFormat
);

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, "../logs/%DATE%.log"),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
  level: 'info',
  format: logFormat 
});

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: coloredConsoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }),
    fileRotateTransport
  ]
});

export default logger;