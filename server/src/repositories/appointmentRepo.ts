import { IAppointmentRepository, IDoctorInfo } from "../interfaces/appointmentRepo";
import { inject,injectable } from "inversify";
import TYPES from "../di/types";
import { IAppointment } from "../models/appointment/appointmentInterface";
import AppointmentModel from "../models/appointment/appointmentModel";
import { ICreateAppointmentDTO, ProfitData } from "../types/types";
import { stripe } from "../config/stripe";
import { Types } from "mongoose";
import { IPrescription } from "../models/prescription/priscriptionInterface";
import PrescriptioModel from "../models/prescription/prescriptionModel";
import { IDoctor } from "../models/doctor/doctorInterface";
import { 
  startOfWeek, endOfWeek, eachDayOfInterval, 
  startOfMonth, endOfMonth, eachWeekOfInterval,
  startOfYear, endOfYear, eachMonthOfInterval, 
  format, 
  differenceInDays
} from 'date-fns';
import DoctorModel from "../models/doctor/doctorModel";
import { IPatient } from "../models/patient/patientInterface";
import PatientModel from "../models/patient/patientModel";

@injectable()
export class AppointmentRepo implements IAppointmentRepository {
  private appointmentModel: typeof AppointmentModel;
  private prescriptionModel:typeof PrescriptioModel;
  private doctorModel:typeof DoctorModel;
  private patientModel:typeof PatientModel;


  constructor(
    @inject(TYPES.AppointmentModel) appointmentModel: typeof AppointmentModel,
    @inject(TYPES.PrescriptionModel) prescriptionModel : typeof PrescriptioModel,
    @inject(TYPES.DoctorModel) doctorModel:typeof DoctorModel,
    @inject(TYPES.PatientModel) patientModel:typeof PatientModel
  ) {
    this.appointmentModel = appointmentModel;
    this.prescriptionModel=prescriptionModel;
    this.doctorModel=doctorModel;
    this.patientModel=patientModel
  }

  getPrescriptionForDoctor(AppointmentId: string): Promise<IPrescription[] | null> {
    throw new Error("Method not implemented.");
  }

  async createAppointment(appointmentData: ICreateAppointmentDTO): Promise<IAppointment> {
    console.log("test")
    const appointment = await this.appointmentModel.create(appointmentData);
    console.log("New appointment",appointment)
    return appointment;
  }

  async getSingleAppointment(id: string): Promise<IAppointment | null> {
     let appointment= await this.appointmentModel.findById(id).populate("doctorId")
     if(!appointment){
      throw new Error("No appointment data")
     }
     return appointment
  }

  async createCheckoutSession(amount: number, doctorName: string, appointmentId: string): Promise<{ sessionId: string; }> {
    const session=await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Appointment with Dr. ${doctorName}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        appointmentId,
      },
    });
    console.log("checkout",session)
    return {sessionId:session.id}
  }

  async updatePaymentStatus(appointmentId: string): Promise<void> {
    console.log(AppointmentModel.findByIdAndUpdate(appointmentId, {
      paymentStatus: 'paid',
      status:"booked",
    }))
    await AppointmentModel.findByIdAndUpdate(appointmentId, {
      paymentStatus: 'paid',
      status:"booked",
    });
  }

  async getPatientAppointment(
    id: string, 
    page: number = 1, 
    limit: number = 10,
    filterStatus: string = "all"  
  ): Promise<{ appointment: IAppointment[] | null; total: number }> {
    const skip = (page - 1) * limit;
    const objectId = new Types.ObjectId(id);
    
 
    const query: any = { patientId: objectId };
    
   
    if (filterStatus !== "all") {
      query.status = filterStatus;
    }
  
    let [appointment, total] = await Promise.all([
      AppointmentModel.find(query)
        .skip(skip)
        .limit(limit)
        .populate("doctorId")
        .sort({ createdAt: -1 })
        .exec(),
      AppointmentModel.countDocuments(query)  
    ]);
  
    return { appointment, total };
  }

async getDoctorAppointment(
    doctorId: string,
    page: number = 1,
    limit: number = 5,
    status: string = 'all',
    startDate?: string,
    endDate?: string,
    searchQuery?: string 
): Promise<{ appointments: IAppointment[] | null; total: number }> {
    const skip = (page - 1) * limit;
    
    const query: any = { doctorId };
    
    if (status !== 'all') {
        query.status = status;
    }
    
    // Date range filter
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    } else if (startDate) {
        query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
        query.date = { $lte: new Date(endDate) };
    }

 
    if(searchQuery && searchQuery.trim() !== '') {
        const searchRegex = new RegExp(searchQuery, "i");
        

        const patientQuery = {
            $or: [
                { name: searchRegex },
                { email: searchRegex }
            ]
        };

       
        const matchingPatients = await PatientModel.find(patientQuery).select('_id').lean();
        const patientIds = matchingPatients.map(p => p._id);

    
        query.$or = [
            { patientId: { $in: patientIds } },
            { appointmentId: searchRegex }
        ];
    }

    const [appointments, total] = await Promise.all([
        AppointmentModel.find(query)
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'patientId',
            })
            .sort({ createdAt: -1 })
            .lean()
            .exec(),
        AppointmentModel.countDocuments(query)
    ]);

    return { 
        appointments: appointments.length > 0 ? appointments : null, 
        total 
    };
}
  async getAllAppointment(page: number=1, limit: number=10): Promise<IAppointment[] | null> {
     const skip=(page-1)*limit;
     let response=await AppointmentModel.find().populate("patientId").populate("doctorId").sort({createdAt:-1}).exec()
     return response
  }

  async changeAppointmentStatus(appointmentId:string,status:string):Promise<IAppointment | null>{
       let appointment=await this.appointmentModel.findByIdAndUpdate(appointmentId,{status:status},{new:true})
       return appointment
  }

   async createPrescription(prescriptionData: IPrescription): Promise<IPrescription> {
     
    const prescription = await this.prescriptionModel.create({
      appointmentId: new Types.ObjectId(prescriptionData.appointmentId),
      doctorId: new Types.ObjectId(prescriptionData.doctorId),
      patientId: new Types.ObjectId(prescriptionData.patientId),
      diagnosis: prescriptionData.diagnosis,
      medications: prescriptionData.medications,
      instructions: prescriptionData.instructions
  });

  await this.appointmentModel.findByIdAndUpdate(
    prescriptionData.appointmentId,
    {$set:{
      prescriptionId:prescription._id
    }},
    {new:true}
  )

  return prescription;
   }
 
   async getPrescription(AppointmentId: string): Promise<IPrescription[] | null> {
     return await this.prescriptionModel.find({appointmentId:AppointmentId}).populate("appointmentId").populate("patientId").populate("doctorId").exec()
   }

   async  getTotalAppointment(): Promise<number> {
     return await AppointmentModel.find({paymentStatus:"paid"}).countDocuments()
   }

   async getAllAppointments(): Promise<IAppointment[]> {
    return await this.appointmentModel.find()
        .populate<{ doctorId: IDoctor }>("doctorId") 
        .exec();
}

   async getLatestAppointment():Promise<IAppointment[]>{
    return await AppointmentModel.find().sort({createdAt:-1}).limit(10).populate("doctorId").populate("patientId")
   }

   async getTotalDoctorsAppointments(doctorId: string): Promise<number> {
     return await AppointmentModel.find({doctorId:doctorId}).countDocuments()
   }

   async getCounsulterAppointments(doctorId: string): Promise<number> {
    const count = await AppointmentModel.countDocuments({
        doctorId: doctorId,
        status: 'completed'
    });
    console.log("dfjdf",count)

    return count;
  }

  async getTodaysAppointments(doctorId: string): Promise<{appointments: IAppointment[], count: number} | null> {
   
    let today=new Date();
      today.setHours(0,0,0,0)
    const appointments = await AppointmentModel.find({doctorId: doctorId,date:{$gte:today}}).sort({createdAt:-1}).limit(5).populate("doctorId").populate("patientId").exec();
    
  
    
    return appointments.length > 0 ? {appointments, count: appointments.length} : null;
}

async getProfitData(range: "weekly" | "monthly" | "yearly"): Promise<ProfitData> {
  const now = new Date();
  let startDate: Date, endDate: Date, intervalDates: Date[], dateFormat: string;


  switch (range) {
    case 'weekly':
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      intervalDates = eachDayOfInterval({ start: startDate, end: endDate });
      dateFormat = 'EEE'; 
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      intervalDates = eachWeekOfInterval({ start: startDate, end: endDate });
      dateFormat = 'MMM dd';
      break;
    case 'yearly':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      intervalDates = eachMonthOfInterval({ start: startDate, end: endDate });
      dateFormat = 'MMM'; 
      break;
    default:
      throw new Error('Invalid time range');
  }

 
  const appointments = await AppointmentModel.find({
    date: { $gte: startDate, $lte: endDate },
    paymentStatus: 'paid'
  }).populate({
    path: 'doctorId',
    select: 'consultantFee'
  });


  const labels = intervalDates.map(date => format(date, dateFormat));
  const data = intervalDates.map(date => {
 
    const filteredAppointments = appointments.filter(appointment => {
      const appointmentDate = appointment.date;
      
      if (range === 'weekly') {
        return (
          appointmentDate.getDate() === date.getDate() &&
          appointmentDate.getMonth() === date.getMonth() &&
          appointmentDate.getFullYear() === date.getFullYear()
        );
      } else if (range === 'monthly') {
        const weekEnd = new Date(date);
        weekEnd.setDate(date.getDate() + 6);
        return appointmentDate >= date && appointmentDate <= weekEnd;
      } else { 
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return appointmentDate >= date && appointmentDate <= monthEnd;
      }
    });

   
    return filteredAppointments.reduce((sum, appointment) => {
      let profit = 0;
      

      profit += 120;
      

      if (appointment.status === 'completed' && appointment.doctorId) {
        const consultantFee = (appointment.doctorId as IDoctor).consultantFee || 0;
        profit += consultantFee;
      }
      
   
    
      
      return sum + profit;
    }, 0);
  });

  const total = data.reduce((sum, val) => sum + val, 0);

  return { labels, data, total };
}


async getCustomProfitData(dateRange: { startDate: Date; endDate: Date }): Promise<ProfitData> {
  const { startDate, endDate } = dateRange;
  
  // Determine the best interval based on date range span
  const diffInDays = differenceInDays(endDate, startDate);
  
  let intervalDates: Date[];
  let dateFormat: string;

  if (diffInDays <= 7) {
    // Daily intervals for short ranges (< 1 week)
    intervalDates = eachDayOfInterval({ start: startDate, end: endDate });
    dateFormat = 'EEE, MMM dd';
  } else if (diffInDays <= 31) {
    // Weekly intervals for medium ranges (< 1 month)
    intervalDates = eachWeekOfInterval({ start: startDate, end: endDate });
    dateFormat = 'MMM dd';
  } else {
    // Monthly intervals for long ranges (> 1 month)
    intervalDates = eachMonthOfInterval({ start: startDate, end: endDate });
    dateFormat = 'MMM yyyy';
  }

  // Fetch paid appointments in the given range
  const appointments = await AppointmentModel.find({
    date: { $gte: startDate, $lte: endDate },
    paymentStatus: 'paid'
  }).populate({
    path: 'doctorId',
    select: 'consultantFee'
  });

  // Generate labels and calculate profit (same logic as before)
  const labels = intervalDates.map(date => format(date, dateFormat));
  const data = intervalDates.map(date => {
    const filteredAppointments = appointments.filter(appointment => {
      const appointmentDate = appointment.date;
      
      if (diffInDays <= 7) {
        // Daily filtering
        return (
          appointmentDate.getDate() === date.getDate() &&
          appointmentDate.getMonth() === date.getMonth() &&
          appointmentDate.getFullYear() === date.getFullYear()
        );
      } else if (diffInDays <= 31) {
        // Weekly filtering
        const weekEnd = new Date(date);
        weekEnd.setDate(date.getDate() + 6);
        return appointmentDate >= date && appointmentDate <= weekEnd;
      } else {
        // Monthly filtering
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return appointmentDate >= date && appointmentDate <= monthEnd;
      }
    });

    return filteredAppointments.reduce((sum, appointment) => {
      let profit = 120; // Base fee
      
      if (appointment.status === 'completed' && appointment.doctorId) {
        profit += (appointment.doctorId as IDoctor).consultantFee;
      }
      
      return sum + profit;
    }, 0);
  });

  const total = data.reduce((sum, val) => sum + val, 0);

  return { labels, data, total };
}

async getDoctorsByPatient(patientId: string): Promise<IDoctor[] | null> {

  const doctorIds = await this.appointmentModel
    .distinct('doctorId', { patientId })
    .exec();

  if (!doctorIds.length) return null;


  const doctors = await this.doctorModel.find({
    _id: { $in: doctorIds }
  }).exec();

  return doctors.length ? doctors : null;
}

async getPatientsByDoctors(doctorId: string): Promise<IPatient[] | null> {
  const patientIds=await this.appointmentModel.distinct('patientId',{doctorId}).exec()
  if(!patientIds.length){
    return null
  }

  const patients=await this.patientModel.find({
    _id:{$in:patientIds}
  }).exec()

  return patients
}



}


