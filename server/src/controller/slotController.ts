import { injectable,inject } from "inversify";
import TYPES from "../di/types";
import { ISlotService } from "../interfaces/slot.service";
import { Request, Response } from "express";
import logger from "../utils/logger";
import { HttpStatus } from "../utils/httptatus";
import { errorResponse, successResponse } from "../types/types";
import { StatusMessages } from "../utils/message";
import { s } from "vite/dist/node/types.d-aGj9QkWt";

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

    async getAllSlotsOfDoctor(req:Request,res:Response){
        try {
             const doctorId=req.params.id
              if(!doctorId){
                logger.warn("Doctor id is missing")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.BAD_REQUEST))
              }
              let response=await this._slotService.getAllSlotByDOctor(doctorId)
               if(response){
                logger.info("Slot data fetched successfully")
               }
              return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,response))
        } catch (error:any) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR))
        }
    }
}