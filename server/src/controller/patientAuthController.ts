import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import PatientService from "../services/patientService";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/jwtHelper";
import TYPES from "../di/types";
import { HttpStatus } from "../utils/httptatus";
import { errorResponse, successResponse } from "../types/types";
import logger from "../utils/logger";

@injectable()
class PatientAuthController {
    constructor(@inject(TYPES.PatientService) private _patientService: PatientService) {
        logger.info("PatientAuthController initialized");
    }

    async signup(req: Request, res: Response) {
        try {
            const { name, email, password, confirmPassword } = req.body;
            logger.debug(`Patient signup attempt for ${email}`);
            
            const result = await this._patientService.registerPatient(name, email, password, confirmPassword);
            logger.info(`Patient ${email} registered successfully`);
            
            res.status(HttpStatus.CREATED).json(successResponse("Patient registration completed successfully", result));
        } catch (error: any) {
            logger.error(`Patient signup failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.BAD_REQUEST).json(errorResponse(error.message));
        }
    }

    async verifyOtp(req: Request, res: Response) {
        try {
            const { email, otp } = req.body;
            logger.debug(`Verifying OTP for ${email}`);
            
            const result = await this._patientService.verifyOtp(email, otp);
            logger.info(`OTP verified for ${email}`);
            
            res.status(HttpStatus.OK).json(successResponse("OTP verified successfully", result));
        } catch (error: any) {
            logger.error(`OTP verification failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
        }
    }

    async resendOtp(req: Request, res: Response) {
        try {
            const { email } = req.body;
            logger.debug(`Resending OTP to ${email}`);
            
            const result = await this._patientService.resendOtp(email);
            logger.info(`OTP resent to ${email}`);
            
            res.status(HttpStatus.OK).json(successResponse("OTP resent successfully", result));
        } catch (error: any) {
            logger.error(`OTP resend failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.BAD_REQUEST).json(errorResponse(error.message));
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            logger.debug(`Login attempt for ${email}`);
            
            const result = await this._patientService.loginPatient(email, password);
            const { accessToken, refreshToken, patientId } = result;
            
            logger.info(`Patient ${email} logged in successfully`);
            
            res.cookie("patientToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", 
                sameSite: "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000,
            });
            
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", 
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            
            res.status(HttpStatus.OK).json({ accessToken, patientId });
        } catch (error: any) {
            logger.error(`Login failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.BAD_REQUEST).json(errorResponse(error.message));
        }
    }

    async refreshToken(req: Request, res: Response): Promise<any> {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                logger.warn("Refresh token missing");
                return res.status(HttpStatus.UNAUTHORIZED).json(errorResponse("Refresh Token missing"));
            }
            
            const secretKey = process.env.JWT_REFRESH_SECRET as string;
            
            jwt.verify(refreshToken, secretKey, (err: any, decode: any) => {
                if (err) {
                    logger.warn("Invalid refresh token");
                    return res.status(HttpStatus.FORBIDDEN).json(errorResponse("Invalid Refresh token"));
                }
                
                logger.debug(`Generating new access token for ${decode.email}`);
                const newAccessToken = generateAccessToken(decode.id, decode.email, "patient");
                res.status(HttpStatus.OK).json({ accessToken: newAccessToken });
            });
        } catch (error: any) {
            logger.error("Refresh token error", { error: error.message });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(error.message));
        }
    }

    async googleAuth(req: Request, res: Response) {
        try {
            const { googleId, email } = req.body;
            logger.debug(`Google auth attempt for ${email}`);
            
            if (!googleId || !email) {
                logger.warn("Google auth missing required fields");
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse("Google ID and email are required"));
            }

            const tokens = await this._patientService.googleAuth(googleId, email);
            const { accessToken, refreshToken } = tokens;
            
            logger.info(`Google auth successful for ${email}`);
            
            res.cookie("patientToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", 
                sameSite: "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000,
            });
            
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", 
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            
            res.status(HttpStatus.OK).json(successResponse("Google authentication successful", tokens));
        } catch (error: any) {
            logger.error(`Google auth failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(error.message));
        }
    }
}

export default PatientAuthController;