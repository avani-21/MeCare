import API from "@/lib/axiosInstane";
import { IPatient, IReview } from "@/type/patient";
import { IApp } from "@/type/patient";

const getProfile=async ()=>{
 try {
    let response=await API.get("/patient/patient_profile")
    console.log("PROOOO:",response)
    return response
 } catch (error) {
   throw new Error("Error fetching patient data") 
 } 
}

const appointmentBook=async (data:IApp)=>{
    try {
      let response=API.post("/patient/doctor/appointment",data)
      return response
    } catch (error:any) {
       console.log(error.message)
    }
}

const updateProfile = async (updatedData: FormData) => {
  try {
    console.log("Sending data to server...");
    // Log FormData contents before sending
    for (const [key, value] of updatedData.entries()) {
      console.log(key, value);
    }

    const response = await API.patch(`/patient/profile`, updatedData, {
      headers: {
        'Content-Type': 'multipart/form-data' // This is crucial
      }
    });
    return response;
  } catch (error: any) {
    console.log("Error:", error.message);
    if (error.response) {
      console.log("Server response:", error.response.data);
    }
    throw error; // Re-throw to handle in component
  }
};

const changePassword=async (data:{newPassword:string,confirmPassword:string})=>{
  try {
       let response=await API.patch(`/patient/change_password`,data)
       return response
  } catch (err:any) {
     console.log(err.message)
  }
}

const getAppointment=async ()=>{
  try {
    let id=localStorage.getItem("AppointmentId")
    let response=await API.get(`/patient/doctor/appointment_booking/${id}`)
  return response
  } catch (error:any) {
     console.log(error.message)
  }
}

const checkOut=async (amount:number,doctorName:string)=>{
try {
  let id=localStorage.getItem("AppointmentId")
  let response=await API.post("/patient/create_payment",{
    amount,
    doctorName,
    id
  })
  return response.data.data
} catch (error:any) {
  console.error("Checkout error:", error.message);
  throw error; 
}

}

const markAsPaid=async ()=>{
  let id=localStorage.getItem("AppointmentId")
  let response=await API.patch("/patient/change_payment_status",{id})
  return response
}

const getAppointmentData=async (page:number,limit:number,filterStatus:string)=>{
  try {
     let response=API.get(`/patient/get_appointment`,{
     params:{
      page,
      limit,
      filterStatus
     }
     })
     console.log("response",response)
     return response
  } catch  (error:any) {
    throw error
  }
}

const getPrescription=async (appointmentId:string)=>{
  try {
     let response=API.get(`/patient/prescription/${appointmentId}`)
     console.log(response)
     return response
  } catch (error:any) {
     console.log("Eoor fetxhing prescription",error)
  }
}

const addReview=async (reviewData:IReview)=>{
  console.log(reviewData)
  try {
    if (!reviewData.doctorId || typeof reviewData.doctorId !== 'string') {
      throw new Error('Invalid appointment ID');
    }
    let response=await API.post(`/patient/review/${reviewData.doctorId}`,reviewData)
    console.log(response)
    return response
  } catch (error) {
     console.log(error)
  }
}

const getReview=async (appointmentId:string)=>{
  try {
      let response= await API.get(`/patient/review/${appointmentId}`)
      console.log("review",response.data.data)
      return response.data.data
  } catch (error) {
    console.log(error)
  }
}

const getReviews=async (doctorId:string)=>{
  try {
      let response=await API.get(`/doctor/reviews/${doctorId}`)
       console.log(response)
       return response.data
  } catch (error) {
    console.log("Error",error)
  }
}

export {getProfile,appointmentBook,updateProfile,changePassword,getAppointment,checkOut,getAppointmentData,markAsPaid,getPrescription,addReview,getReview,getReviews}