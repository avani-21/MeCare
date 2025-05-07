import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import logger from "../utils/logger";
import { HttpStatus } from "../utils/httptatus";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

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

const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
      const authHeader = req.headers['authorization'];

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          res.status(HttpStatus.UNAUTHORIZED).json({
              error: "Access Denied. No token provided.",
          });
          return
      }

      const token = authHeader.split(" ")[1];
      const secretKey = process.env.JWT_SECRET as string;

      jwt.verify(token, secretKey, (err, decoded: any) => {
          if (err && err.name === "TokenExpiredError") {
              return res.status(HttpStatus.UNAUTHORIZED).json({
                  error: "Access Token Expired. Please refresh your token.",
                  code: "TOKEN_EXPIRED",
              });
          }

          if (err) {
              return res.status(HttpStatus.BAD_REQUEST).json({
                  error: "Invalid token.",
              });
          }

          if (!decoded || decoded.role !== "admin") {
              return res.status(HttpStatus.FORBIDDEN).json({
                  error: "Forbidden. Unauthorized role.",
              });
          }

          req.user = decoded;
          next();
      });
  } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid token." });
  }
};

export default authenticateAdmin;


