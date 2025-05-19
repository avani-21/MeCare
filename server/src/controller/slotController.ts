import { injectable,inject } from "inversify";
import TYPES from "../di/types";
import { ISlotService } from "../interfaces/slot.service";
import { Request, Response } from "express";
import logger from "../utils/logger";
import { HttpStatus } from "../utils/httptatus";
import { errorResponse, successResponse } from "../types/types";
import { StatusMessages } from "../utils/message";
import { s } from "vite/dist/node/types.d-aGj9QkWt";
import { AuthenticatedRequest } from "../middleware/patientAuthMiddleware";
import { Http } from "winston/lib/winston/transports";

@injectable()
export class SlotController{
    constructor(@inject(TYPES.SlotService) private _slotService:ISlotService){}
       
    async findSlotBydoctor(req:Request,res:Response){
        try {
            const doctorId=req.params.id
            console.log(doctorId)
            if(!doctorId){
                logger.warn("Doctor id is missing")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
            }
            let result=await this._slotService.getSlotsByDoctor(doctorId)
            console.log("ans",result)
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,result))
        } catch (error:any) {
            logger.error(error.message)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error))
        }
    }

    async createSlot(req:Request,res:Response){
        try {
            const doctorId=req.params.id
            const { date, startTime, endTime } = req.body;
           const slot=await this._slotService.createSlot({
            doctorId,
            date,
            startTime,
            endTime
           })
           if(slot){
            return res.status(HttpStatus.CREATED).json(successResponse(StatusMessages.CREATED,slot))
           }
        } catch (error:any) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error))
        }
    }

async getAllSlotsOfDoctor(req: Request, res: Response) {
    try {
        const doctorId = req.params.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        // Parse date parameters if they exist
        let startDate: Date | undefined;
        let endDate: Date | undefined;
        
        if (req.query.startDate) {
            startDate = new Date(req.query.startDate as string);
            if (isNaN(startDate.getTime())) {
                return res.status(HttpStatus.BAD_REQUEST).json(
                    errorResponse("Invalid start date format")
                );
            }
        }
        
        if (req.query.endDate) {
            endDate = new Date(req.query.endDate as string);
            if (isNaN(endDate.getTime())) {
                return res.status(HttpStatus.BAD_REQUEST).json(
                    errorResponse("Invalid end date format")
                );
            }
        }
        
        // Validate date range if both are provided
        if (startDate && endDate && startDate > endDate) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                errorResponse("Start date cannot be after end date")
            );
        }

        if (!doctorId) {
            logger.warn("Doctor id is missing");
            return res.status(HttpStatus.BAD_REQUEST).json(
                errorResponse(StatusMessages.BAD_REQUEST)
            );
        }

        const response = await this._slotService.getAllSlotByDoctor(
            doctorId,
            page,
            limit,
            startDate,
            endDate
        );

        return res.status(HttpStatus.OK).json(
            successResponse(StatusMessages.OK, response)
        );
    } catch (error: any) {
        logger.error(error.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
            errorResponse(StatusMessages.INTERNAL_SERVER_ERROR)
        );
    }
}
    async editSlot(req:AuthenticatedRequest,res:Response){
        try {
            let doctorId=req.user?.id

             if(!doctorId){
                logger.warn("doctor id is missing")
                return res.status(HttpStatus.NOT_FOUND).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
             }
            let slotId=req.params.id
            if(!slotId){
                 logger.warn("slot id is missing")
                return res.status(HttpStatus.NOT_FOUND).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
            }
          const updatedSlots=await this._slotService.editSlot(slotId,{doctorId,...req.body})
          if(updatedSlots){
            logger.info("Slot data updated successfully")
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,updatedSlots))
          }
            
        } catch (error) {
             logger.error("error updaing the slots")
              return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR))
        }
    }

    async cancelSlot(req:Request,res:Response){
        try {
             let slotId=req.params.id
             if(!slotId){
                logger.warn("Slot id is missing")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
             }

             let response=await this._slotService.cancelSlot(slotId)
             if(response){
                logger.info("Slot deletedd successfully")
               return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK))
             }
        } catch (error) {
             return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR))
        }
    }
    
    async createRecurringSlots(req: AuthenticatedRequest, res: Response) {
        try {
            const doctorId = req.user?.id;
            const { 
                startDate, 
                endDate, 
                startTime, 
                endTime, 
                frequency, 
                interval, 
                weekdays 
            } = req.body;

            if (!doctorId || !startDate || !endDate || !startTime || !endTime || !frequency) {
                return res.status(HttpStatus.BAD_REQUEST).json(
                    errorResponse("Missing required fields")
                );
            }

            const slots = await this._slotService.generateRecurringSlots({
                doctorId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                startTime,
                endTime,
                frequency,
                interval: interval || 1,
                weekdays
            });

            return res.status(HttpStatus.CREATED).json(
                successResponse("Recurring slots created successfully", slots)
            );
        } catch (error: any) {
            logger.error("Error creating recurring slots: " + error.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                errorResponse(error.message || "Failed to create recurring slots")
            );
        }
    }
}