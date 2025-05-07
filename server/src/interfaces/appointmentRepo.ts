import { IAppointment } from "../models/appointment/appointmentInterface";
import { ICreateAppointmentDTO, ProfitData } from "../types/types";
import { IPrescription } from "../models/prescription/priscriptionInterface";


export interface IAppointmentRepository{
    createAppointment(appointmentData: ICreateAppointmentDTO): Promise<IAppointment>;
    getSingleAppointment(id:string):Promise<IAppointment | null>
    getPatientAppointment(id:string,page:number,limit:number,filterStatus :string):Promise<{appointment:IAppointment[] | null; total:number}>
    createCheckoutSession(
        amount: number,
        doctorName: string,
        appointmentId: string
      ): Promise<{ sessionId: string }>;
    
      updatePaymentStatus(appointmentId: string): Promise<void>;
     getDoctorAppointment(doctorId:string,page:number,limit:number):Promise<IAppointment[] | null>
     getAllAppointment(page:number,limit:number):Promise<IAppointment[] | null>
     changeAppointmentStatus(appointmentId:string,status:string):Promise<IAppointment | null>
     createPrescription(prescriptionData:IPrescription):Promise<IPrescription>
     getPrescription(AppointmentId:string):Promise<IPrescription[] | null>
     getTotalAppointment():Promise<number>
     getLatestAppointment():Promise<IAppointment[]>
     getAllAppointments():Promise<IAppointment[]>
     getTotalDoctorsAppointments(doctorId:string):Promise<number>
     getCounsulterAppointments(doctorId:string):Promise<number>
     getTodaysAppointments(doctorId:string): Promise<{appointments: IAppointment[], count: number} | null> 
     getProfitData(range:'weekly'|'monthly'|'yearly'):Promise<ProfitData>
   
}
