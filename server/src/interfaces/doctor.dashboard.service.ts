import { IAppointment } from "../models/appointment/appointmentInterface";

export interface IDoctorDashboard{
    getDoctorDashboard(doctorId:string):Promise<{
        summary:{
            totalAppointment:number;
            consultedAppointment:number;
        };
        todaysAppointments:IAppointment[] | null;
    }>
}