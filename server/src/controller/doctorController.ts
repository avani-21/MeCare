import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import { IDoctorService } from "../interfaces/doctorService";
import { HttpStatus } from "../utils/httptatus";
import { errorResponse, successResponse } from "../types/types";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/jwtHelper";
import logger from "../utils/logger";

@injectable()
class DoctorController {
    constructor(@inject(TYPES.DoctorService) private _doctorService: IDoctorService) {
        logger.info("DoctorController initialized");
    }

    async getApprovedDoctors(req: Request, res: Response) {
        try {
            logger.debug("Fetching approved doctors");
            const doctors = await this._doctorService.getApprovedDoctors();
            logger.info(`Fetched approved doctors`);
            return res.status(HttpStatus.OK).json(successResponse("Doctor data fetched successfully", doctors));
        } catch (error) {
            logger.error("Error fetching approved doctors", { error });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse("Internal server error"));
        }
    }

    async sendOtp(req: Request, res: Response) {
        try {
            const { email } = req.body;
            logger.debug(`Sending OTP to ${email}`);
            const result = await this._doctorService.sendOtp(email);
            logger.info(`OTP sent to ${email}`);
            res.status(HttpStatus.OK).json(successResponse(result));
        } catch (error: any) {
            logger.error(`OTP send failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.BAD_REQUEST).json(errorResponse(error.message));
        }
    }

    async verifyOtp(req: Request, res: Response) {
        try {
            const { email, otp } = req.body;
            logger.debug(`Verifying OTP for ${email}`);
            const result = await this._doctorService.verifyOtp(email, otp);
            
            const { accessToken, refreshToken, id } = result;
            logger.info(`OTP verified for ${email}, setting cookies`);
            
            res.cookie("DoctorToken", accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000,
            });
            
            res.cookie("refreshToken", refreshToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(HttpStatus.OK).json({ id, accessToken, refreshToken });
        } catch (error: any) {
            logger.error(`OTP verification failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.BAD_REQUEST).json(errorResponse(error.message));
        }
    }

    async resendOtp(req: Request, res: Response) {
        try {
            const { email } = req.body;
            logger.debug(`Resending OTP to ${email}`);
            const response = await this._doctorService.resendOtp(email);
            logger.info(`OTP resent to ${email}`);
            res.status(HttpStatus.OK).json(successResponse(response));
        } catch (error: any) {
            logger.error(`OTP resend failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.BAD_REQUEST).json(errorResponse(error.message));
        }
    }

    async googleAuth(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) {
                logger.warn("Google auth attempted without email");
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse("Email is required"));
            }
            
            logger.debug(`Processing Google auth for ${email}`);
            await this._doctorService.googleAuth(email);
            logger.info(`Google auth OTP sent to ${email}`);
            res.status(HttpStatus.OK).json(successResponse("OTP sent to email for Google login."));
        } catch (error: any) {
            logger.error("Google auth failed", { error: error.message });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse('Google authentication failed.'));
        }
    }

    async updateDoctor(req: Request, res: Response) {
        try {
            const doctorId = req.params.doctorId;
            if (!doctorId) {
                logger.warn("Update attempted without doctorId");
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse("Doctor id is required"));
            }

            logger.debug(`Updating doctor ${doctorId}`);
            const updatedDoctor = await this._doctorService.updateData(doctorId, req.body, req.file);
            
            if (updatedDoctor) {
                logger.info(`Doctor ${doctorId} updated successfully`);
                res.status(HttpStatus.OK).json(updatedDoctor);
            } else {
                logger.warn(`Doctor not found for update: ${doctorId}`);
                res.status(HttpStatus.NOT_FOUND).json(errorResponse("Doctor not found"));
            }
        } catch (error: any) {
            logger.error(`Error updating doctor ${req.params.doctorId}`, { error: error.message });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(error.message));
        }
    }

    async getDoctor(req: Request, res: Response) {
        try {
            const doctorId = req.params.doctorId;
            if (!doctorId) {
                logger.warn("Doctor fetch attempted without ID");
                return res.status(HttpStatus.NOT_FOUND).json(errorResponse("Doctor not found"));
            }

            logger.debug(`Fetching doctor ${doctorId}`);
            const doctor = await this._doctorService.getDoctor(doctorId);
            
            if (doctor) {
                logger.info(`Doctor ${doctorId} fetched successfully`);
                return res.status(HttpStatus.OK).json(successResponse("Doctor data fetched successfully", doctor));
            } else {
                logger.warn(`Doctor not found: ${doctorId}`);
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse("Doctor not found"));
            }
        } catch (error: any) {
            logger.error(`Error fetching doctor ${req.params.doctorId}`, { error: error.message });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse("Internal server error"));
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                logger.warn("Refresh token missing");
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse("Refresh Token missing"));
            }

            const secretKey = process.env.JWT_REFRESH_SECRET;
            if (!secretKey) {
                logger.error("JWT refresh secret missing");
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse("Server error: missing secret key"));
            }

            jwt.verify(refreshToken, secretKey, (err: any, decoded: any) => {
                if (err) {
                    logger.warn("Invalid refresh token");
                    return res.status(HttpStatus.FORBIDDEN).json(errorResponse("Invalid refresh token"));
                }

                if (!decoded?.id || !decoded?.email || !decoded?.role) {
                    logger.warn("Invalid token payload", { decoded });
                    return res.status(HttpStatus.BAD_REQUEST).json(errorResponse("Invalid token payload"));
                }

                logger.debug(`Generating new access token for ${decoded.email}`);
                const newAccessToken = generateAccessToken(decoded.id, decoded.email, decoded.role);
                return res.status(HttpStatus.OK).json({ accessToken: newAccessToken });
            });
        } catch (error: any) {
            logger.error("Refresh token error", { error: error.message });
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(error.message));
        }
    }
}

export default DoctorController;