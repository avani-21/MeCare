import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
     res.status(401).json({ error: "Access Denied. No token provided." });
     return
    }

    const token = authHeader.split(" ")[1];

    const secretKey = process.env.JWT_SECRET as string;


    jwt.verify(token, secretKey, (err, decoded: any) => {
      if (err) {
        return res.status(401).json({ error: "Access Token Expired. Please refresh your token." });
      }
     logger.debug("Decoded:",decoded)
      if (!decoded || decoded.role !== "admin") {
        return res.status(403).json({ error: "Forbidden. Unauthorized role." });
      }

      req.user = decoded;
      next();
    });

  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};

export default authenticateAdmin;
