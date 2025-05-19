import { ICreateAppointmentDTO } from "../types/types";
import { IAppointment } from "../models/appointment/appointmentInterface";
import { IPrescription } from "../models/prescription/priscriptionInterface";
import { IDoctor } from "../models/doctor/doctorInterface";
import { IPatient } from "../models/patient/patientInterface";

export interface IAppointmentService{
    handleAppointmentBooking(data: ICreateAppointmentDTO): Promise<IAppointment>;
    getSingleAppointment(id:string):Promise<IAppointment | null>
    checkout(amount: number, doctorName: string, appointmentId: string): Promise<{ sessionId: string }>;
    markAsPaid(appointmentId: string): Promise<void>;
    getPatientAppointment(id:string,page:number,limit:number,filterStatus :string):Promise<{appointment:IAppointment[] | null; total:number}>
 getDoctorAppointment(
    doctorId: string,
    page: number,
    limit: number,
    status: string,
    startDate?: string,
    endDate?: string,
    searchQuery?:string
): Promise<{ appointments: IAppointment[] | null; total: number }>
    getAllAppointments(page:number,limit:number):Promise<IAppointment[] | null>
    changeAppointmentStatus(appointmentId:string,staatus:string):Promise<IAppointment | null>
    createPrescription(prescriptionData:IPrescription):Promise<IPrescription>
    getPrescription(AppointmentId:string):Promise<IPrescription[] | null>
     getDoctorByPatient(patientId:String):Promise<IDoctor[] | null>
      getPatientsByDoctors(doctorId:string):Promise<IPatient[] | null>



}