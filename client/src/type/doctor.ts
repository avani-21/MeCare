

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

export interface IPresscription{
  appointmentId: string;
  doctorId?: string;
  patientId:string;
  diagnosis: string;
  medications: string[] | string;
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
  medications: string[] | string;
  instructions: string;
}

export interface DoctorDashboardData{
    todaysAppointmentCount: number;
    totalAppointment:number
    consultedAppointment:number
    todaysAppointment:number 
}
