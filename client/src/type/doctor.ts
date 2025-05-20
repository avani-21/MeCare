

export interface SlotFormData {
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
}


export interface Slot {
  _id: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}


export interface IPresscription{
  appointmentId: string;
  doctorId?: string;
  patientId:string;
  diagnosis: string;
  medications: Medication[] | string ;
  instructions: string;
}

export interface Prescription{
  appointmentId: string;
  doctorId?: { fullName: string };
  patientId: {
    age: string;
    gender: string; name: string 
};
  diagnosis: string;
  medications: Medication[] | string;
  instructions: string;
  createdAt?:Date;
}

export interface DoctorDashboardData{
    todaysAppointmentCount: number;
    totalAppointment:number
    consultedAppointment:number
    todaysAppointment:number 
}


export interface RecurringSlotFormData {
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  weekdays?: number[];
}