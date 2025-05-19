import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import { IAdminDashboard } from "../interfaces/admin.dashboard.service";
import { IDoctorDashboard } from "../interfaces/doctor.dashboard.service";
import { HttpStatus } from "../utils/httptatus";
import { StatusMessages } from "../utils/message";
import { errorResponse, successResponse } from "../types/types";
import logger from "../utils/logger";
import { Request, Response } from "express";
import { Http } from "winston/lib/winston/transports";

@injectable()
export class DashboardController {
    constructor(
        @inject(TYPES.AdminDashboardService) private _adminDashboardService: IAdminDashboard,
        @inject(TYPES.DoctorDashboardService) private _doctorDashboardService: IDoctorDashboard
    ) {}

    async getDashboard(req: Request, res: Response) {
        try {
            let response = await this._adminDashboardService.getAdminDashboard();
            if (response) {
                return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK, response));
            }
            return res.status(HttpStatus.NOT_FOUND).json(errorResponse(StatusMessages.NOT_FOUND));
        } catch (error) {
            logger.error("Error occurred getting data for admin dashboard", error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR));
        }
    }

    async getDoctorDashboard(req: Request, res: Response) {
        try {
            const doctorId = req.params.id;
            if (!doctorId) {
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse("Doctor ID is required"));
            }

            const dashboardData = await this._doctorDashboardService.getDoctorDashboard(doctorId);
            
            if (dashboardData) {
                return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK, dashboardData));
            }
            return res.status(HttpStatus.NOT_FOUND).json(errorResponse("No dashboard data found for this doctor"));
        } catch (error) {
            logger.error("Error occurred getting doctor dashboard data", error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR));
        }
    }

    
async getProfitDataForAdmin(req: Request, res: Response) {
  try {
    const range = req.query.range as 'weekly' | 'monthly' | 'yearly' | 'custom';
    
    if (range === 'custom') {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid custom date range');
      }
      
      const data = await this._adminDashboardService.getCustomProfitData({ startDate, endDate });
      return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK, data));
    } else {
      const data = await this._adminDashboardService.getProfitData(range);
      return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK, data));
    }
  } catch (error: any) {
    logger.error("Error fetching profit data", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(StatusMessages.INTERNAL_SERVER_ERROR, error)
    );
  }
}
}