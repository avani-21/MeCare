import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

const authenticatePatient = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Access Denied. No token provided." });
        }

        const secretKey = process.env.ACCESS_TOKEN_SECRET as string;
        jwt.verify(token, secretKey, (err: any, decoded: any) => {
            if (err) {
                return res.status(401).json({ error: "Access Token Expired. Please refresh your token." });
            }

            if (decoded.role !== "patient") {
                return res.status(403).json({ error: "Forbidden. Unauthorized role." });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        return res.status(400).json({ error: "Invalid token." });
    }
};


export default authenticatePatient;
