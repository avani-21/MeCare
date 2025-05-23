import { NextFunction, request, Request, Response } from "express";
import { inject, injectable } from "inversify";
import PatientService from "../services/patientService";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/jwtHelper";
import TYPES from "../di/types";
import { HttpStatus } from "../utils/httptatus";
import { errorResponse, successResponse } from "../types/types";
import logger from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/patientAuthMiddleware";
import { StatusMessages } from "../utils/message";
import { IReview } from "../models/reviews/reviewInterface";




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

            res.status(HttpStatus.CREATED).json(successResponse(StatusMessages.REGISTRATION_SUCCESS, result));
        } catch (error: any) {
            logger.error(`Patient signup failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error.message));
        }
    }

    async verifyOtp(req: Request, res: Response) {
        try {
            const { email, otp } = req.body;
            logger.debug(`Verifying OTP for ${email}`);

            const result = await this._patientService.verifyOtp(email, otp);
            logger.info(`OTP verified for ${email}`);

            res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK, result));
        } catch (error: any) {
            logger.error(`OTP verification failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR));
        }
    }

    async resendOtp(req: Request, res: Response) {
        try {
            const { email } = req.body;
            logger.debug(`Resending OTP to ${email}`);

            const result = await this._patientService.resendOtp(email);
            logger.info(`OTP resent to ${email}`);

            res.status(HttpStatus.OK).json(successResponse(StatusMessages.OTP_SENT, result));
        } catch (error: any) {
            logger.error(`OTP resend failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error.message));
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

            res.status(HttpStatus.OK).json({ accessToken, patientId });
        } catch (error: any) {
            logger.error(`Login failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error.message));
        }
    }

    async refreshToken(req: Request, res: Response): Promise<any> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    error: "Refresh Token missing",
                    code: "REFRESH_TOKEN_MISSING"
                });
            }

            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, (err: any, decode: any) => {
                if (err) {
                    return res.status(HttpStatus.FORBIDDEN).json({
                        error: "Invalid Refresh token",
                        code: "INVALID_REFRESH_TOKEN"
                    });
                }

                const newAccessToken = generateAccessToken(decode.id, decode.email, "patient");

                // Set the new access token in cookie
                res.cookie("patientToken", newAccessToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 15 * 60 * 1000 // 15 minutes
                });

                return res.status(HttpStatus.OK).json({
                    accessToken: newAccessToken,
                    expiresIn: 15 * 60 // Tell frontend when it expires
                });
            });
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: "Token refresh failed",
                code: "REFRESH_FAILED"
            });
        }
    }

    async googleAuth(req: Request, res: Response) {
        try {
            const { googleId, email } = req.body;
            logger.debug(`Google auth attempt for ${email}`);

            if (!googleId || !email) {
                logger.warn("Google auth missing required fields");
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.BAD_REQUEST));
            }

            const tokens = await this._patientService.googleAuth(googleId, email);
            const { accessToken, refreshToken } = tokens;

            logger.info(`Google auth successful for ${email}`);

            res.cookie("patientToken", accessToken, {
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

            res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK, tokens));
        } catch (error: any) {
            logger.error(`Google auth failed for ${req.body.email}`, { error: error.message });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error.message));
        }
    }

    async sendOtp(req: Request, res: Response) {
        try {
            const { email } = req.body
            if (!email) {
                logger.warn("Email  is  not provided")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.EMAIL_REQUIRED))
            }

            let result = await this._patientService.resendOtp(email)
            logger.info("OTP send to your email successfully")
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OTP_SENT, result))
        } catch (error: any) {
            logger.error("Error sending otp", error.message)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR, error.message))
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { email, password } = req.body
            if (!email) {
                logger.warn("Patient not fount")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.EMAIL_REQUIRED))
            }

            if (!password) {
                logger.warn("Password not provided")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.BAD_REQUEST))
            }

            let result = await this._patientService.resetPassword(email, password)
            logger.info("Password resetted successfully")
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK, result))
        } catch (error: any) {
            logger.error(error.message)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR, error.message))
        }
    }

    async getPatientProfile(req: Request, res: Response) {
        try {

            const user = (req as AuthenticatedRequest).user;

            if (!user) {
                logger.warn("No user information found in request");
                return res.status(HttpStatus.UNAUTHORIZED).json(
                    errorResponse("Authentication required")
                );
            }

            const email = (req as any).user?.email; 

            if (!email) {
                logger.warn("No email found in JWT payload");
                return res.status(HttpStatus.BAD_REQUEST).json(
                    errorResponse(StatusMessages.EMAIL_REQUIRED)
                );
            }

            const patient = await this._patientService.getUserProfile(email);
            logger.info("Patient profile fetched successfully");
            return res.status(HttpStatus.OK).json(
                successResponse(StatusMessages.OK, patient)
            );
        } catch (error: any) {
            logger.error("Error fetching user profile");
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                errorResponse(StatusMessages.INTERNAL_SERVER_ERROR, error.message)
            );
        }
    }


    async updateProfile(req: AuthenticatedRequest, res: Response) {
        try {

            const patientId = req.user?.id;
            console.log(patientId)

            console.log(req.body)
            console.log("image",req.file)

            if (!patientId) {
                logger.warn("No patient ID found in request");
                return res.status(HttpStatus.UNAUTHORIZED).json(
                    errorResponse("Authentication required")
                );
            }


            logger.debug(`Updating profile for patient ${patientId}`);
            const updatedPatient = await this._patientService.updateProfile(patientId, req.body, req.file);
            if (updatedPatient) {
                logger.info(`Doctor ${patientId} updated successfully`);
                return res.status(HttpStatus.OK).json(successResponse("Profile updated successfully", updatedPatient));
            } else {
                logger.warn(`Doctor not found for update: ${patientId}`);
                return res.status(HttpStatus.NOT_FOUND).json(errorResponse("Doctor not found"));
            }
        } catch (error: any) {
            logger.error("Error updating patient profile", { error: error.message });
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                errorResponse("Error updating profile", error.message)
            );
        }
    }

    async changePassword(req: AuthenticatedRequest, res: Response) {
        try {
            const patientId = req.user?.id;

            if (!patientId) {
                logger.warn("No patient ID found in request");
                return res.status(HttpStatus.UNAUTHORIZED).json(
                    errorResponse("Authentication required")
                );
            }

            const { newPassword, confirmPassword } = req.body;

            if (!newPassword || !confirmPassword) {
                logger.warn("Password fields are missing");
                return res.status(HttpStatus.BAD_REQUEST).json(
                    errorResponse("New password and confirm password are required")
                );
            }

            if (newPassword !== confirmPassword) {
                logger.warn("Passwords do not match");
                return res.status(HttpStatus.BAD_REQUEST).json(
                    errorResponse("Passwords do not match")
                );
            }

            await this._patientService.changePassword(patientId, newPassword, confirmPassword);

            logger.info(`Password changed successfully for patient ${patientId}`);

            return res.status(HttpStatus.OK).json(
                successResponse("Password changed successfully")
            );
        } catch (error: any) {
            logger.error("Error changing password", { error: error.message });
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                errorResponse("Error changing password", error.message)
            );
        }
    }

    async createReview(req:Request,res:Response){
        try {
            

            const reviewData:IReview={
                doctorId:req.params.doctorId,
                patientId:req.body.patientId,
                appointmentId:req.body.appointmentId,
                ratings:req.body.ratings,
                comment:req.body.comment
            }
           let response=await this._patientService.createReview(reviewData)
           if(response){
            logger.info("Review Added successfully")
            return res.status(HttpStatus.CREATED).json(successResponse(StatusMessages.CREATED,response))
           }
        } catch (error:any) {
            logger.error("Error adding review",error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error))
        }
    }

    async getReview(req:Request,res:Response){
        try {
            let appointmentId=req.params.appointmentId
            console.log(appointmentId)
            if (!appointmentId) {
                logger.error("Appointment ID is required");
                return res.status(HttpStatus.BAD_REQUEST).json(
                  errorResponse(StatusMessages.BAD_REQUEST, "Appointment ID is required")
                );
              }
            let response=await this._patientService.getReviewByAppointment(appointmentId)
            if(response){
                logger.info("Review fwtched successfully")
                return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,response))
            }else {
                logger.info("No review found for this appointment");
                return res.status(HttpStatus.NOT_FOUND).json(
                  errorResponse(StatusMessages.NOT_FOUND, "No review found")
                );
              }
        } catch (error:any) {
            logger.error("error fetching review")
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error))
        }
    }

    async getReviewByDoctorId(req:Request,res:Response){
        try {
            let doctorId=req.params.doctorId;
            if(!doctorId){
                logger.warn("Doctor id is missing")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
            }
            let response=await this._patientService.getReviewByDoctorId(doctorId)
            if(response){
                logger.info("Doctor review fetched successfully")
              return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,response))
            }
        } catch (error:any) {
          logger.error("Error ocuuered during review data fetching",error)   
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR))
        }
    }

    async logOut(req:Request,res:Response){
        try {
            res.clearCookie("accessToken",{
                httpOnly:true,
                secure:true,
                sameSite:"none"
            })
            logger.info("JWT cleared from cooki successfully")
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK))
        } catch (error) {
             return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR))
        }
    }

    async updateReview(req:Request,res:Response){
        try {
            const reviewId=req.params.reviewId;
            const updatedData={
                ratings:req.body.ratings,
                comment:req.body.comment
            }

            if(!reviewId){
                logger.warn("review id is required")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
            }

            const response=await this._patientService.updateReview(reviewId,updatedData)
             if (response) {
            logger.info("Review updated successfully");
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK, response));
        } else {
            logger.info("Review not found");
            return res.status(HttpStatus.NOT_FOUND).json(
                errorResponse(StatusMessages.NOT_FOUND, "Review not found")
            );
        }
        } catch (error:any) {
            logger.error("Error updting review",error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error))
        }
    }
}

export default PatientAuthController;