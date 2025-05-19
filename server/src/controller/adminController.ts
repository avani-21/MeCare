import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import AdminService from "../services/adminSrevice";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtHelper";
import { HttpStatus } from "../utils/httptatus";
import { errorResponse, successResponse } from "../types/types";
import logger from "../utils/logger";
import { StatusMessages } from "../utils/message";
import { AuthenticatedRequest } from "../middleware/patientAuthMiddleware";


@injectable()
export class AdminController {
    private _adminService: AdminService;

    constructor(@inject(TYPES.AdminService) adminService: AdminService) {
        this._adminService = adminService;
    }

    async adminLogin(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            logger.http(`Admin login attempt: ${email}`);
            logger.debug(`Request body: ${JSON.stringify(req.body)}`);

            const { accessToken, refreshToken } = await this._adminService.loginAdmin(email, password);

          logger.info("admin logged in successfully")
            res.cookie("adminToken", accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.status(HttpStatus.CREATED).json(successResponse(StatusMessages.CREATED, { accessToken,refreshToken }));
        } catch (error: any) {
            res.status(HttpStatus.UNAUTHORIZED).json(errorResponse(StatusMessages.UNAUTHORIZED,error.message));
        }
    }

    async refreshToken(req: Request, res: Response): Promise<any> {
        try {
            const refreshToken = req.cookies.refreshToken;
    
            if (!refreshToken) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    error: "Refresh token missing",
                    code: "REFRESH_TOKEN_MISSING",
                });
            }
    
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
                id: string;
                email: string;
            };
    
            // Generate new tokens (optionally rotate refresh token)
            const newAccessToken = generateAccessToken(decoded.id, decoded.email, "admin");
            const newRefreshToken = generateRefreshToken(decoded.id, decoded.email, "admin");
    
            // Set new cookies
            res.cookie("adminToken", newAccessToken, {
                httpOnly: false,
                maxAge: 15 * 60 * 1000,
            });
    
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: false,
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
    
            return res.status(HttpStatus.OK).json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });
        } catch (error: any) {
            if (error.name === "TokenExpiredError") {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    error: "Refresh token expired",
                    code: "REFRESH_TOKEN_EXPIRED",
                });
            }
            return res.status(HttpStatus.FORBIDDEN).json({ error: "Invalid token." });
        }
    }

      async logOut(req:Request,res:Response){
        try {
            res.clearCookie("patientToken",{
                httpOnly:true,
                secure:false,
                sameSite:"none"
            })
            logger.info("JWT cleared from cooki successfully")
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK))
        } catch (error) {
             return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR))
        }
    }

    async togglePatientBlockStatus(req:Request,res:Response){
        try {
            let patientId=req.params.id
            if(!patientId){
                logger.warn("Patient id is missing")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
            }
            let response=await this._adminService.togglePatientStatus(patientId)
            if(response){
                logger.info("Status changged successfully")
                return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK))
            }
        } catch (error) {
            logger.warn("Error occured during the patient status toggle")
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR))
        }
    }
}
