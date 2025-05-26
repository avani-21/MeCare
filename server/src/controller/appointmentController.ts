import { inject,injectable } from "inversify";
import TYPES from "../di/types";
import { IAppointmentService } from "../interfaces/appointmentService";
import { HttpStatus } from "../utils/httptatus";
import { errorResponse, successResponse } from "../types/types";
import { Request,response,Response } from "express";
import logger from "../utils/logger";
import { stripe } from "../config/stripe";
import { AuthenticatedRequest } from "../middleware/patientAuthMiddleware";
import { Types } from "mongoose";
import { StatusMessages } from "../utils/message";
import { IPrescription } from "../models/prescription/priscriptionInterface";

@injectable()
export class AppointmentController{
    constructor(
        @inject(TYPES.AppointmentService) private _appointmentService:IAppointmentService
    ){}

    async bookAppointment(req:AuthenticatedRequest,res:Response){

      let patientId= req?.user?.id

        try {
            const {
                doctorId,
                slotId,
                date,
                startTime,endTime}=req.body


                if (!patientId) {
                    return res.status(HttpStatus.UNAUTHORIZED).json(
                      errorResponse(StatusMessages.ID_NOT_FOUNT)
                    );
                  }


                const appointment=await this._appointmentService.handleAppointmentBooking({
                    patientId: new Types.ObjectId(patientId),
                    doctorId,
                    slotId,
                    date: new Date(date),
                    startTime,
                    endTime,
                    status: "pending",
                    paymentStatus: "unpaid",
                    amount: 120
                })

               res.status(HttpStatus.CREATED).json(successResponse(StatusMessages.OK,appointment))
        } catch (error:any) {
             return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error.message))
        }
    }

    async getSingleAppointment(req:Request,res:Response){
        try {
            const id=req.params.id
            if(!id){
                logger.warn("Appointment id is missing")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
            }
            let appointment=await this._appointmentService.getSingleAppointment(id)
            res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,appointment))
        } catch (error:any) {
             logger.error(error.message) 
             return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error.message))
        }
    }

    async checkOutSession(req:Request,res:Response){
        try {
            const {amount,doctorName,id:appointmentId}=req.body
             const session=await this._appointmentService.checkout(amount,doctorName,appointmentId)
             res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,session))
        } catch (error:any) {
            console.error('Checkout error:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR))
        }
    }

    async markAppointmentpaid(req:Request,res:Response){
        try {
            const appointmentId=req.body.id
            if(!appointmentId){
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT));
            }
            await this._appointmentService.markAsPaid(appointmentId)
            return res.status(HttpStatus.OK).json(successResponse("Appointment marked as paid"));
        } catch (error:any) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse("Failed to update payment status", error.message));
        }
    }

    async getPatientAppointment(req:AuthenticatedRequest,res:Response){
        try {
             console.log("authId",req.user?.id)
            const id = req.user?.id
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const filter=req.query.filterStatus as string
            console.log("filter status",filter)
            console.log("patientId",id)
            if(!id){
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
            }
            let response=await this._appointmentService.getPatientAppointment(id,page,limit,filter)
            console.log(response)
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,response))
        } catch (error:any) {
             return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR))
        }
    }

    async getDoctorAppointment(req:AuthenticatedRequest,res:Response){
        try {
   const doctorId = req.user?.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string || 'all';
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const searchQuery=req.query.searchQuery as string

        if (!doctorId) {
            return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.BAD_REQUEST));
        }

            
            let response=await this._appointmentService.getDoctorAppointment(  doctorId,
            page,
            limit,
            status,
            startDate,
            endDate,
            searchQuery?.trim()
            );
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,response))
        } catch (error) {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR))
        }
    }

    async getAllAppointments(req:Request,res:Response){
       try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        let appointments=await this._appointmentService.getAllAppointments(page,limit)
        if(appointments){
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,appointments))
        }
       } catch (error:any) {
         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error.message))
       }
    }

    async changeAppointmentStatus(req:Request,res:Response){
        try {
            let appointmentId=req.params.id
            const { status } = req.body;
            console.log(req.body)
            if(!appointmentId){
                logger.warn("Appointment id is missing")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
            }

            if (!status || !['booked', 'completed', 'cancelled', 'pending'].includes(status)) {
                logger.warn("Invalid status provided");
                return res.status(HttpStatus.BAD_REQUEST).json(
                    errorResponse(StatusMessages.BAD_REQUEST)
                );
            }
            console.log(req.body)
            let response=await this._appointmentService.changeAppointmentStatus(appointmentId,status)
            console.log(response)
            if(response){
                return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,response))
            }
        } catch (error) {
             logger.error("Error occured while updatinging the status",error)
             return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(successResponse(StatusMessages.INTERNAL_SERVER_ERROR,error))
        }
    }


    async createPrescription(req:Request,res:Response){
        try {
             const {appointmentId,patientId,diagnosis,instructions,medications}=req.body
             const doctorId=req.params.id

             if(!Array.isArray(medications)){
                throw new Error("Medication must be an array of object")
             }

                if (
            !Types.ObjectId.isValid(appointmentId) ||
            !Types.ObjectId.isValid(doctorId) ||
            !Types.ObjectId.isValid(patientId)
        ) {
            return res.status(400).json(errorResponse("Invalid ID(s) provided"));
        }

             for(const med of medications){
                if(!med.frequency || !med.name || !med.dosage || !med.duration){
                    throw new Error("Each medication  must have a name,duration,frequency,and dosage")
                }
             }
             const prescriptionData:IPrescription={
                appointmentId,
                doctorId,
                patientId,
                diagnosis,
                medications,
                instructions
             }

             const response=await this._appointmentService.createPrescription(prescriptionData)
             if(response){
               logger.info("Prescription created successfully") 
               return res.status(HttpStatus.CREATED).json(successResponse(StatusMessages.CREATED,response)) 
             }
        } catch (error:any) {
            logger.error("Error adding  prescription")
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error.message))
        }
    }

    async getPrescription(req:Request,res:Response){
        try {
            const { appointmentId } = req.params;
            const prescription = await this._appointmentService.getPrescription(appointmentId)
            if(!prescription){
                logger.warn("No prescription found")
                return res.status(HttpStatus.NOT_FOUND).json(errorResponse(StatusMessages.NOT_FOUND))
            }
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,prescription))
        } catch (error:any) {
            logger.warn("Error fetching prescription")
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error))
        }
    }

    async getDoctorByPatient(req: AuthenticatedRequest, res: Response) {
        try {
          const patientId = req.user?.id;
          if (!patientId) {
            logger.warn("Patient id is missing");
            return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT));
          }
          
          let response = await this._appointmentService.getDoctorByPatient(patientId);
          if (response) {
            logger.info("Doctors data fetched successfully");
            return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK, response));
          }
          
          return res.status(HttpStatus.NOT_FOUND).json(errorResponse(StatusMessages.NOT_FOUND));
          
        } catch (error: any) {
          logger.error("Internal server error", error);
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR, error));
        }
      }


      async getPatientsByDoctors(req:AuthenticatedRequest,res:Response){
        try {
            let doctorId=req.user?.id
            if(!doctorId){
                logger.warn("Doctor is  missing in the request")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
            }
            let response=await this._appointmentService.getPatientsByDoctors(doctorId)
            if(response){
                logger.info("patient data fetched successfully");
                return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,response))
            }
            return res.status(HttpStatus.NOT_FOUND).json(errorResponse(StatusMessages.NOT_FOUND));
        } catch (error:any) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error))  
        }
      }

   
}