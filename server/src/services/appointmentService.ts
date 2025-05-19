import { inject, injectable } from "inversify";
import { ICreateAppointmentDTO } from "../types/types";
import { IAppointmentRepository } from "../interfaces/appointmentRepo";
import { IAppointmentService } from "../interfaces/appointmentService";
import TYPES from "../di/types";
import { IAppointment } from "../models/appointment/appointmentInterface";
import { SlotService } from "../services/slotServie";
import mongoose from "mongoose";
import { SlotRepo } from "../interfaces/slot.repo";
import { IPrescription } from "../models/prescription/priscriptionInterface";
import logger from "../utils/logger";
import { IDoctor } from "../models/doctor/doctorInterface";
import { IPatient } from "../models/patient/patientInterface";

@injectable()
export class AppointmentService implements IAppointmentService {
  private _appointmentRepository: IAppointmentRepository;
  private _slotRepository: SlotRepo;
  private _slotService: SlotService;

  constructor(
    @inject(TYPES.AppointmentRepository) _appointmentRepository: IAppointmentRepository,
    @inject(TYPES.SlotService) _slotService: SlotService,
    @inject(TYPES.SlotRepository) _slotRepository: SlotRepo // <-- Add this
  ) {
    this._appointmentRepository = _appointmentRepository;
    this._slotService = _slotService;
    this._slotRepository = _slotRepository; // <-- Initialize it
  }
  

  async handleAppointmentBooking(data: ICreateAppointmentDTO): Promise<IAppointment> {
    const { patientId, doctorId, slotId, date, startTime, endTime } = data;
    

    const isSlotAvailable = await this._slotService.checkSlotAvailability(slotId.toString());
    if (!isSlotAvailable) {
      throw new Error("Slot is not available");
    }
    
     const appointmentId = `APP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const appointment = await this._appointmentRepository.createAppointment({
        patientId: new mongoose.Types.ObjectId(patientId),  
        doctorId: new mongoose.Types.ObjectId(doctorId),
        slotId: new mongoose.Types.ObjectId(slotId),
        appointmentId,
        date,
        startTime,
        endTime,
        status: "pending",
        paymentStatus: "unpaid",
        amount: 120,
      });
    
    await this._slotRepository.markSlotAsBooked(slotId.toString());
    return appointment;
  }
   
  async getSingleAppointment(id:string):Promise<IAppointment | null>{
       return await this._appointmentRepository.getSingleAppointment(id)
  }

  async checkout(amount: number, doctorName: string, appointmentId: string) {
    return this._appointmentRepository.createCheckoutSession(amount, doctorName, appointmentId);
  }

  async markAsPaid(appointmentId: string) {
    await this._appointmentRepository.updatePaymentStatus(appointmentId);
  }

  async getPatientAppointment(
    id: string, 
    page: number, 
    limit: number,
    filterStatus: string = "all"  
  ): Promise<{ appointment: IAppointment[] | null; total: number }> {
    let appointment = await this._appointmentRepository.getPatientAppointment(
      id,
      page,
      limit,
      filterStatus 
    );
    return appointment;
  }


async getDoctorAppointment(
    doctorId: string,
    page: number = 1,
    limit: number = 5,
    status: string = 'all',
    startDate?: string,
    endDate?: string,
    searchQuery?:string
): Promise<{ appointments: IAppointment[] | null; total: number }> {
    const appointments = await this._appointmentRepository.getDoctorAppointment(
        doctorId,
        page,
        limit,
        status,
        startDate,
        endDate,
        searchQuery
    );
    return appointments;
}

  async getAllAppointments(page: number=1, limit: number=10): Promise<IAppointment[] | null> {
    let appointments=await this._appointmentRepository.getAllAppointment(page,limit)
    return appointments
  }


  async changeAppointmentStatus(appointmentId: string, status: string): Promise<IAppointment | null> {
     const appointment=await this._appointmentRepository.getSingleAppointment(appointmentId)
    if(!appointment){
      return null
    }
    if (appointment.status === 'completed' && status !== 'completed') {
      throw new Error('Cannot change status from completed');
  }


  if(appointment.status === "cancelled" && status === "completed"){
    throw new Error("Can not change status from cancelled to completed")
  }
  
    let result=await this._appointmentRepository.changeAppointmentStatus(appointmentId,status)
    return result
  }

  async createPrescription(prescriptionData: IPrescription): Promise<IPrescription> {
    try {
      
        if (!prescriptionData.appointmentId || !prescriptionData.doctorId || 
            !prescriptionData.patientId || !prescriptionData.diagnosis) {
            throw new Error('Missing required fields');
        }

      
        if (!Array.isArray(prescriptionData.medications)) {
            throw new Error('Medications must be an array');
        }

      for(const med of prescriptionData.medications){
        if(!med.name || !med.duration || !med.frequency || !med.dosage){
           throw new Error("Each medication must have name,frequency,dosage and duration")
        }
      }


        return await this._appointmentRepository.createPrescription(prescriptionData);
    } catch (error) {
        logger.error('Error in prescription service', error);
        throw error;
    }
}

async getPrescription(AppointmentId: string): Promise<IPrescription[] | null> {
  return await this._appointmentRepository.getPrescription(AppointmentId)
}

async getDoctorByPatient(patientId: string): Promise<IDoctor[] | null> {
   return await this._appointmentRepository.getDoctorsByPatient(patientId)
}

async getPatientsByDoctors(doctorId: string): Promise<IPatient[] | null> {
  return await this._appointmentRepository.getPatientsByDoctors(doctorId)
}

}
