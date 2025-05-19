import API from "@/lib/axiosInstane";
import { IMessage, IPatient, IReview } from "@/type/patient";
import { IApp } from "@/type/patient";

const getProfile=async ()=>{
 try {
    let response=await API.get("/patient/patient_profile")
    console.log("PROOOO:",response)
    return response
 } catch (error) {
   console.error("Error fetching patient data:", error); 
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

const updateReview=async(reviewId:string,updatedData:IReview)=>{
   try {
     let response=await API.put(`/patient/reviews/${reviewId}`,updatedData)
     if(response){
      return response.data.data
     }
   } catch (error) {
      console.log("Error",error)
   }
}

const sendMessage=async (messageData:IMessage)=>{
  try {
    let response=await API.post(`/patient//send_message`,messageData)
    console.log(response)
    return response.data
  } catch (error) {
    console.log("Error",error)
  }
}

 const getConversation = async (user1Id: string) => {
  try {
    const response = await API.get(`/patient/get_conversation/${user1Id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

const getDoctorByPatient=async ()=>{
  try {
    const response= await API.get(`/patient/get_doctors`)
    return response
  } catch (error) {
     console.log(error)
  }
}

const logOut = async () => {
  try {
    const response = await API.post('/patient/logOut') 

    // Remove cookies immediately
    document.cookie = 'patientToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return null
  }
}
const getUnredMessageCount = async (receiverId: string): Promise<number> => {
  try {
    const response = await API.get(`/patient/get_unread_message_count/${receiverId}`);
    return response?.data?.data || 0;
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    throw error;
  }
};

const getMessageMark = async (receiverId: string): Promise<any> => {
  try {
    const response = await API.put(`/patient/mark_read/${receiverId}`, {});
    return response?.data?.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};


export {getProfile,appointmentBook,updateProfile,changePassword,getAppointment,checkOut,getAppointmentData,markAsPaid,getPrescription,addReview,getReview,getReviews,getConversation,sendMessage,getDoctorByPatient,logOut,getUnredMessageCount,getMessageMark,updateReview}