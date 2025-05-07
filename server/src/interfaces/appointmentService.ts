import { ICreateAppointmentDTO } from "../types/types";
import { IAppointment } from "../models/appointment/appointmentInterface";
import { IPrescription } from "../models/prescription/priscriptionInterface";

export interface IAppointmentService{
    handleAppointmentBooking(data: ICreateAppointmentDTO): Promise<IAppointment>;
    getSingleAppointment(id:string):Promise<IAppointment | null>
    checkout(amount: number, doctorName: string, appointmentId: string): Promise<{ sessionId: string }>;
    markAsPaid(appointmentId: string): Promise<void>;
    getPatientAppointment(id:string,page:number,limit:number,filterStatus :string):Promise<{appointment:IAppointment[] | null; total:number}>
    getDoctorAppointments(doctorId:string,page:number,limit:number):Promise<IAppointment [] | null>
    getAllAppointments(page:number,limit:number):Promise<IAppointment[] | null>
    changeAppointmentStatus(appointmentId:string,staatus:string):Promise<IAppointment | null>
    createPrescription(prescriptionData:IPrescription):Promise<IPrescription>
    getPrescription(AppointmentId:string):Promise<IPrescription[] | null>
}