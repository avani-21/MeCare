import { inject,injectable } from "inversify";
import TYPES from "../di/types";
import { IDoctorDashboard } from "../interfaces/doctor.dashboard.service";
import { IAppointmentRepository } from "../interfaces/appointmentRepo";
import { IAppointment } from "../models/appointment/appointmentInterface";

@injectable()
export class DoctorDashboardService implements IDoctorDashboard{
     private _appointmentRepository:IAppointmentRepository;

     constructor(
        @inject(TYPES.AppointmentRepository) _appointmentRepository:IAppointmentRepository
     ){
        this._appointmentRepository=_appointmentRepository
     }


     async getDoctorDashboard(doctorId: string): Promise<{ 
      summary: { 
          totalAppointment: number; 
          consultedAppointment: number;
          todaysAppointmentCount: number; 
      }; 
      todaysAppointments: IAppointment[] | null; 
  }> {
      const [
          totalAppointment,
          consultedAppointment,
          todaysAppointmentsData 
      ] = await Promise.all([
          this._appointmentRepository.getTotalDoctorsAppointments(doctorId),
          this._appointmentRepository.getCounsulterAppointments(doctorId),
          this._appointmentRepository.getTodaysAppointments(doctorId)
      ]);
  
      return {
          summary: {
              totalAppointment,
              consultedAppointment,
              todaysAppointmentCount: todaysAppointmentsData?.count || 0 
          },
          todaysAppointments: todaysAppointmentsData?.appointments || null 
      };
  }

     
}