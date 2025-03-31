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
  


  