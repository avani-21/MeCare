import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import { IAdminDashboard } from "../interfaces/admin.dashboard.service";
import { IAppointmentRepository } from "../interfaces/appointmentRepo";
import { IDoctorRepo } from "../interfaces/doctor.repo";
import { IPatientRepository } from "../interfaces/patient.repository";
import { populate } from "dotenv";
import { IDoctor } from "../models/doctor/doctorInterface";
import { ProfitData } from "../types/types";

@injectable()
export class AdminDashboardService implements IAdminDashboard {
    private _appointmentRepository: IAppointmentRepository;
    private _doctorRepository: IDoctorRepo;
    private _patientRepository: IPatientRepository;

    constructor(
        @inject(TYPES.AppointmentRepository) _appointmentRepository: IAppointmentRepository,
        @inject(TYPES.DoctorRepository) _doctorRepository: IDoctorRepo,
        @inject(TYPES.PatientRepository) _patientRepository: IPatientRepository
    ) {
        this._appointmentRepository = _appointmentRepository;
        this._doctorRepository = _doctorRepository;
        this._patientRepository = _patientRepository;
    }

    async getAdminDashboard() {
        const [doctors, patients, appointments, latestAppointments] =
            await Promise.all([
                this._doctorRepository.getAllDoctors(),
                this._patientRepository.getTotalPatients(),
                this._appointmentRepository.getTotalAppointment(),
                this._appointmentRepository.getLatestAppointment()
            ]);

     
        let totalProfit = 0;
        const allAppointments = await this._appointmentRepository.getAllAppointments();
        
        for (const appointment of allAppointments) {
            if(appointment.paymentStatus === 'paid'){
                totalProfit += 120;
            }
          
            if (appointment.status === 'completed') {
             
                if (typeof appointment.doctorId === 'object' && 'consultantFee' in appointment.doctorId) {
                    totalProfit += (appointment.doctorId as IDoctor).consultantFee;
                }
            }
        }

        return {
            summary: {
                doctors,
                patients,
                appointments,
                profit: totalProfit  
            },
            latestAppointments
        };
    }

    async getProfitData(range: "weekly" | "monthly" | "yearly"): Promise<ProfitData> {
        return await this._appointmentRepository.getProfitData(range)
    }

    async getCustomProfitData(dateRange: { startDate: Date; endDate: Date }): Promise<ProfitData> {
  return this._appointmentRepository.getCustomProfitData(dateRange);
}

}
