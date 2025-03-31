import API from "@/lib/axiosInstane";
let doctorId: string | null = null; 

if (typeof window !== 'undefined') {
    doctorId = localStorage.getItem("doctorId");
}


const sendOtp=async (email:string)=>{
 try {
    const response=await API.post("/doctor/send_otp",{email})
    return response
 } catch (error:any) {
      throw new Error(error.message)
 }
}

const verifyOtp=async (email:string,otp:string)=>{
    try {
        const response=await API.post("/doctor/verify_otp",{email,otp})
        console.log(response.data.id)
        localStorage.setItem("doctorId",response.data.id)
        return response
    } catch (error:any) {
        throw new Error(error.message)
    }
}

const resendOtp=async (email:string)=>{
    try {
        const response=await API.post("/doctor/resend_otp",{email})
        return response
    } catch (error:any) {
       throw new Error(error.message)
    }
}

const googleAuth=async (email: string | null)=>{
    try {
        const response=await API.post("/doctor/google-auth",{email})
        return response
     } catch (error:any) {
          throw new Error(error.message)
     }
}

const getDoctor=async ()=>{
  try {
    let doctorId=localStorage.getItem("doctorId")
    let response=await API.get(`/doctor/fetch_doctor/${doctorId}`)
    console.log("doctor data",response.data.data)
    return response.data.data
  } catch (error:any) {
    throw new Error(error.message)
  }
}

const updateDoctor=async (doctorId: string, formData: FormData)=>{
    try {
        console.log(doctorId)
        let result=await API.put(`/doctor/profile/${doctorId}`,formData,{
            headers:{"Content-Type":"multipart/form-data"}
        })

        console.log(result)
        return result

    } catch (error:any) {
        throw new Error(error?.response?.data.message || error.message)
    }
}

export {sendOtp,verifyOtp,resendOtp,getDoctor,updateDoctor,googleAuth}


