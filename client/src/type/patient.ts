export interface ISignUpData{
    name:string,
    email:string,
    password:string,
    confirmPassword:string
}

export interface IPatient {
    _id: string;
    name: string;
    email: string;
    password: string;
    isVerified?: boolean;
    otp?: string;
    otpExpiration?: Date;
    education?:string;
    phone?: string;
    street?: string;
    city?: string;
    gender?: "Male" | "Female" | "Other";
    pincode?: string;
    dob?: Date;
    age?: number;
    profileImage?: string;
  }
  

export interface IVerifyOtp{
    message:string;
    accessToken?:string;
    refreshToken?:string;
    user?:IPatient
}

export interface IResendOtp{
 message:string
}

export interface ILogin{
    email?:string;
    password?:string;
    accessToken?:string;
    refreshToken?:string;
}


export interface IGoogleAuth {
  
      email?: string | null;
      googleId?: string;
      accessToken?:string;
      refreshToken?:string;

  }

 export interface IDoctor {
    street: string;
    pincode: string;
    phone: number;
    email: string;
    about: string;
    education: string;
    _id: string;
    fullName: string;
    specialization: string;
    experience: number;
    rating: number;
    consultantFee: number;
    profileImg?: string; // Optional in case it's missing
    availableDays?: string[]; // Optional as it may not exist
    city?: string;
    state?: string;
  }

  export interface ISlot {
    _id: string;
    doctorId: string;
    date: string;         // "2025-04-27T14:18:11.204Z"
    startTime: string;    // "09:00"
    endTime: string;      // "10:00"
    isAvailable: boolean;
    isBooked: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  export interface ErrorState{
    newPassword?:string;
    confirmPassword?:string
  }

  export interface IAppointment{
    _id:string;
    patientId?: IPatient;
    doctorId?: IDoctor ;
    slotId: string | string;
    date: Date;
    startTime: string;
    endTime: string;
    status: 'booked' | 'completed' | 'cancelled' | 'pending';
    paymentStatus: 'paid' | 'unpaid';
    amount: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

  export interface IApp{
    _id?:string;
    patientId?: string;
    doctorId?: string ;
    slotId: string | string;
    date: Date;
    startTime: string;
    endTime: string;
    status: 'booked' | 'completed' | 'cancelled' | 'pending';
    paymentStatus: 'paid' | 'unpaid';
    amount: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
export interface Appointment {
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  doctorId: IDoctor;
}

export interface IReview{
  createdAt: number;
  _id?:string,
  doctorId?:IDoctor| string;
  patientId?:IPatient |  string;
  appointmentId?:IAppointment | string;
  ratings:number;
  comment?:string;
}
  
export interface Reviews{
  _id?:string,
  doctorId?:IDoctor,
  patientId?:IPatient;
  appointmentId?:IAppointment ;
  ratings:number;
  comment?:string;
  createdAt?:Date;

}


  