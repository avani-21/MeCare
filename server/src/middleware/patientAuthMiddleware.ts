import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { HttpStatus } from "../utils/httptatus";

dotenv.config();

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
        email:string
    };
}

const authenticatePatient = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies.patientToken || req.header("Authorization")?.split(" ")[1];
        console.log("test1",token)

        if (!token) {
           res.status(HttpStatus.UNAUTHORIZED).json({ 
                error: "Access Denied. No token provided." 
            });
            return 
        }

        jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
            if (err) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ 
                    error: "Access Token Expired. Please refresh your token.",
                    code: "TOKEN_EXPIRED"
                });
                console.log("test22")
            }
           

            if (decoded.role !== "patient") {
                return res.status(HttpStatus.FORBIDDEN).json({ 
                    error: "Forbidden. Unauthorized role." 
                });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({ 
            error: "Invalid token." 
        });
    }
};
export default authenticatePatient;