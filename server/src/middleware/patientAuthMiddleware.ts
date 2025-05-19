import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { HttpStatus } from '../utils/httptatus';
import PatientModel from '../models/patient/patientModel'; // Import PatientModel
import { IPatient } from '../models/patient/patientInterface';

dotenv.config();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

const authenticatePatient = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.patientToken || req.header('Authorization')?.split(' ')[1];

    if (!token) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: 'Access Denied. No token provided.',
      });
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET!, async (err: any, decoded: any) => {

      if (err) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          error: 'Access Token Expired. Please refresh your token.',
          code: 'TOKEN_EXPIRED',
        });
      }

      if (decoded.role !== 'patient') {
        return res.status(HttpStatus.FORBIDDEN).json({
          error: 'Forbidden. Unauthorized role.',
        });
      }

      // Check if patient is blocked
      const patient: IPatient | null = await PatientModel.findById(decoded.id);
      if (!patient) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          error: 'Patient not found.',
        });
      }
      if (patient.isBlock) {
        return res.status(HttpStatus.FORBIDDEN).json({
          error: 'Account is blocked.',
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: 'Invalid token.',
    });
  }
};

export default authenticatePatient;