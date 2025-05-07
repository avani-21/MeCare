import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { HttpStatus } from "../utils/httptatus";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const authenticateDoctor = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: "Access Denied. No token provided." });
      return
     }

     const token = authHeader.split(" ")[1];

    const secretKey = process.env.JWT_SECRET as string;
    
    jwt.verify(token, secretKey, (err, decoded: any) => {
      if (err) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: "Access Token Expired. Please refresh your token." });
        return;
      }

      if (!decoded || decoded.role !== "doctor") {
        console.log("role",decoded)
        res.status(HttpStatus.FORBIDDEN).json({ error: "Forbidden. Unauthorized role." });
        return;
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid token." });
  }
};

export default authenticateDoctor;
