import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import AdminService from "../services/adminSrevice";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/jwtHelper";
import { HttpStatus } from "../utils/httptatus";
import { errorResponse, successResponse } from "../types/types";
import logger from "../utils/logger";
import { warn } from "console";

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

            res.status(HttpStatus.CREATED).json(successResponse("Logged in successfully", { accessToken,refreshToken }));
        } catch (error: any) {
            res.status(HttpStatus.UNAUTHORIZED).json(errorResponse(error.message));
        }
    }



    async refreshToken(req: Request, res: Response): Promise<any> {
        try {
            const refreshToken = req.cookies.refreshToken;
            logger.http(`Refresh token request received`);

            if (!refreshToken) {
                logger.warn("Refresh token missing")
                return res.status(401).json({ error: "Refresh Token missing" });
            }
    
            const secretKey = process.env.JWT_REFRESH_SECRET;
           console.log(secretKey)
            if (!secretKey) {
                logger.warn("JWT_REFRESH_SECRET is not defined in .env")
                return res.status(500).json({ error: "Server error: Missing secret key" });
            }
               jwt.verify(refreshToken, secretKey, (err: any, decoded: any) => {
                if (err) {
                    logger.error(err.message)
                    return res.status(403).json({ error: "Invalid Refresh token" });
                }
    
    
                if (!decoded || !decoded.id || !decoded.email) {
                    logger.warn("Invalid token payload")
                    return res.status(400).json({ error: "Invalid token payload" });
                }

                console.log("Received Refresh Token from Cookies:", req.cookies.refreshToken);
                console.log("Using JWT_REFRESH_SECRET for Verification:", process.env.JWT_REFRESH_SECRET);

                const newAccessToken = generateAccessToken(decoded.id, decoded.email,"admin");
                logger.info(`New access token generated for admin: ${decoded.email}`);
                return res.status(200).json({ accessToken: newAccessToken });
            });
    
        } catch (error: any) {
            logger.error("Refresh token error:", error.message);
            return res.status(500).json({ error: error.message });
        }
    }
    

}
