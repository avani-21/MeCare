import { IGoogleAuth, ILogin, IResendOtp, ISignUpData, IVerifyOtp } from "@/type/patient";
import API from "@/lib/axiosInstane";

const signUpPatient=async (data:ISignUpData)=>{
    try{
        const response=await API.post("/patient/register",data);
        return response.data;
    }catch(error:any){
        throw new Error(error.response?.data?.error || error.message);
    }
}

const verifyOtp=async (email:string,otp:string): Promise<IVerifyOtp>=>{
 try{
   const response=await API.post("/patient/otp_verification",{email,otp});
   return response.data
 }catch(error:any){
  throw new Error(error.response?.data?.error || error.message)
 }
}

const resendOtp=async (email:string):Promise<IResendOtp>=>{
    try {
        const response=await API.post("patient/resend_otp",{email});
        return response.data
    } catch (error:any) {
       console.log(error)
      throw new Error(error?.response?.data?.error || error.message) 
    }
}

const loginUser=async (data:ILogin):Promise<ILogin>=>{
    try {
    const response=await API.post("/patient/login",data);
     return response.data
    } catch (error:any) {
        console.log(error)
        throw new Error(error?.response?.data?.error || error.message) 
    }
}


const googleSignIn=async (data:IGoogleAuth):Promise<IGoogleAuth>=>{
 try {
  
    const response=await API.post("/patient/google_auth",data)
     localStorage.setItem("patientToken",response.data.data.accessToken)
    return response.data
 } catch (error:any) {
      console.log(error)
      throw new Error(error?.response?.data?.error || error.message)
 }
}

const sendOtp=async (email:string)=>{
    try {
       const response=await API.post("/patient/send_otp",{email})
       return response
    } catch (error:any) {
         throw new Error(error.message)
    }
   }

   const resetPassword=async (email:string,password:string)=>{
      try {
         const response=await API.post("/patient/reset_password",{email,password})
         return response
      } catch (error:any) {
        throw new Error(error.message)
      }
   }
   


export {signUpPatient,verifyOtp,resendOtp,loginUser,googleSignIn,sendOtp,resetPassword}