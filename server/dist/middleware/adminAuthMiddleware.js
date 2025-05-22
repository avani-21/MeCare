"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const httptatus_1 = require("../utils/httptatus");
dotenv_1.default.config();
// const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
//   try {
//     const authHeader = req.headers['authorization'];
//     console.log("dhbfdhbgjf",req.headers['authorization'])
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//      res.status(HttpStatus.UNAUTHORIZED).json({ error: "Access Denied. No token provided." });
//      return
//     }
//     const token = authHeader.split(" ")[1];
//     const secretKey = process.env.JWT_SECRET as string;
//     jwt.verify(token, secretKey, (err, decoded: any) => {
//       if (err) {
//         console.log("dfdffddgfdgfdgfhghd::::",err)
//         return res.status(HttpStatus.UNAUTHORIZED).json({ error: "Access Token Expired. Please refresh your token." });
//       }
//      logger.debug("Decoded:",decoded)
//       if (!decoded || decoded.role !== "admin") {
//         return res.status(HttpStatus.BAD_REQUEST).json({ error: "Forbidden. Unauthorized role." });
//       }
//       req.user = decoded;
//       next();
//     });
//   } catch (error) {
//     res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid token." });
//   }
// };
const authenticateAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json({
                error: "Access Denied. No token provided.",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const secretKey = process.env.JWT_SECRET;
        jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
            if (err && err.name === "TokenExpiredError") {
                return res.status(httptatus_1.HttpStatus.UNAUTHORIZED).json({
                    error: "Access Token Expired. Please refresh your token.",
                    code: "TOKEN_EXPIRED",
                });
            }
            if (err) {
                return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json({
                    error: "Invalid token.",
                });
            }
            if (!decoded || decoded.role !== "admin") {
                return res.status(httptatus_1.HttpStatus.FORBIDDEN).json({
                    error: "Forbidden. Unauthorized role.",
                });
            }
            req.user = decoded;
            next();
        });
    }
    catch (error) {
        res.status(httptatus_1.HttpStatus.BAD_REQUEST).json({ error: "Invalid token." });
    }
};
exports.default = authenticateAdmin;
