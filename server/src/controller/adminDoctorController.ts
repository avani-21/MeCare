import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import DocregService from "../services/adminDoctor";
import TYPES from "../di/types";
import { HttpStatus } from "../utils/httptatus";
import { errorResponse, successResponse } from "../types/types";
import logger from "../utils/logger";

@injectable()
class DocRegController {
  private _doctorService: DocregService;

  constructor(@inject(TYPES.DoctorRegService) doctorService: DocregService) {
    this._doctorService = doctorService;
    logger.info("DocRegController initialized");
  }

  async registerDoctor(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Attempting to register a new doctor");
      const doctorData = req.body;
      const files = req.files;

      logger.debug("Doctor registration data received", { 
        email: doctorData.email,
        filesCount: files ? Object.keys(files).length : 0 
      });

      const newDoctor = await this._doctorService.registerDoctor(doctorData, files);
      
      logger.info("Doctor registered successfully", { doctorId: newDoctor.id });
      res.status(HttpStatus.CREATED).json(successResponse("Doctor registered successfully", newDoctor));
    } catch (error: any) {
      logger.error("Failed to register doctor", { 
        error: error.message,
        stack: error.stack 
      });
      res.status(HttpStatus.BAD_REQUEST).json(errorResponse(error.message));
    }
  }

  async getDoctorByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      logger.info(`Fetching doctor by email: ${email}`);

      const doctor = await this._doctorService.getDoctorByEmail(email);

      if (!doctor) {
        logger.warn(`Doctor not found for email: ${email}`);
        res.status(HttpStatus.NOT_FOUND).json(errorResponse("Doctor not found"));
        return;
      }

      logger.debug("Doctor fetched successfully", { doctorId: doctor.id });
      res.status(HttpStatus.OK).json(successResponse("Doctor fetched successfully", doctor));
    } catch (error: any) {
      logger.error("Error fetching doctor by email", {
        error: error.message,
        stack: error.stack
      });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(error.message));
    }
  }

  async getAllDoctors(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        specialization: req.query.specialization as string | undefined, 
      };

      logger.info("Fetching all doctors", {
        page,
        limit,
        filters
      });

      const { doctors, total } = await this._doctorService.getAllDoctors(page, limit, filters);
      
      logger.debug(`Fetched ${doctors.length} doctors out of ${total}`);
      res.status(HttpStatus.OK).json(successResponse("Doctors fetched successfully", {
        data: doctors,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          appliedFilters: {
            ...(filters.specialization && { specialization: filters.specialization }),
          }
        }
      }));
    } catch (error: any) {
      logger.error("Error fetching all doctors", {
        error: error.message,
        stack: error.stack
      });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(error.message));
    }
  }

  async updateDoctor(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.id.replace(/^:/, "").trim();
      const updatedData = req.body;

      logger.info(`Attempting to update doctor with ID: ${doctorId}`, {
        updatedFields: Object.keys(updatedData)
      });

      const updatedDoctorData = await this._doctorService.updateDoctor(doctorId, updatedData);
      if (!updatedDoctorData) {
        logger.warn(`Doctor not found for update: ${doctorId}`);
        res.status(HttpStatus.NOT_FOUND).json(errorResponse("Doctor not found"));
        return;
      }

      logger.info(`Doctor updated successfully: ${doctorId}`);
      res.status(HttpStatus.OK).json(successResponse("Doctor updated successfully", updatedDoctorData));
    } catch (error: any) {
      logger.error("Error updating doctor", {
        doctorId: req.params.id,
        error: error.message,
        stack: error.stack
      });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(error.message));
    }
  }

  async toggleDoctorApproval(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.id;
      logger.info(`Toggling approval for doctor: ${doctorId}`);

      const updateData = await this._doctorService.toggleDoctorApproval(doctorId);
      if (!updateData) {
        logger.warn(`Doctor not found for approval toggle: ${doctorId}`);
        res.status(HttpStatus.NOT_FOUND).json(errorResponse("Doctor not found"));
        return;
      }

      logger.info(`Doctor approval toggled successfully: ${doctorId}`, {
        newStatus: updateData.isApproved
      });
      res.status(HttpStatus.OK).json(successResponse(`Doctor ${updateData.isApproved ? "approved" : "disapproved"} successfully`, updateData));
    } catch (error: any) {
      logger.error("Error toggling doctor approval", {
        doctorId: req.params.id,
        error: error.message,
        stack: error.stack
      });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(error.message));
    }
  }

  async getAllPatients(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      logger.info("Fetching all patients", {
        page,
        limit
      });

      const { patients, total } = await this._doctorService.getPatient(page, limit);
      
      logger.debug(`Fetched ${patients.length} patients out of ${total}`);
      res.status(HttpStatus.OK).json(successResponse("Patients fetched successfully", {
        data: patients,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }));
    } catch (error: any) {
      logger.error("Error fetching patients", {
        error: error.message,
        stack: error.stack
      });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(error.message));
    }
  }
}

export default DocRegController;