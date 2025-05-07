import API from "@/lib/axiosInstane";
import { IPresscription, SlotFormData } from "@/type/doctor";
import { error } from "console";
import { get } from "http";
let doctorId: string | null = null;

if (typeof window !== 'undefined') {
    doctorId = localStorage.getItem("doctorId");
}


const sendOtp = async (email: string) => {
    try {
        const response = await API.post("/doctor/send_otp", { email })
        return response
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const verifyOtp = async (email: string, otp: string) => {
    try {
        const response = await API.post("/doctor/verify_otp", { email, otp })
        console.log(response.data.id)
        localStorage.setItem("doctorId", response.data.id)
        return response
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const resendOtp = async (email: string) => {
    try {
        const response = await API.post("/doctor/resend_otp", { email })
        return response
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const googleAuth = async (email: string | null) => {
    try {
        const response = await API.post("/doctor/google-auth", { email })
        return response
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const getDoctor = async () => {
    try {
        let doctorId = localStorage.getItem("doctorId")
        let response = await API.get(`/doctor/fetch_doctor/${doctorId}`)
        console.log("doctor data", response.data.data)
        return response.data.data
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const updateDoctor = async (doctorId: string, formData: FormData) => {
    try {
        console.log(doctorId)
        let result = await API.put(`/doctor/profile/${doctorId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })

        console.log(result)
        return result

    } catch (error: any) {
        throw new Error(error?.response?.data.message || error.message)
    }
}

const getDoctorAppointment = async (doctorId: string) => {
    try {
        if (!doctorId) {
            throw new Error("Id is missing")
        }
        let response = await API.get(`/doctor/my_appointment/${doctorId}`)

        return response.data.data
    } catch (error: any) {
        console.log(error.message)
    }
}

const generateSlot = async (slotData: SlotFormData) => {
    try {
        let response = await API.post(`/doctor/create_slot/${doctorId}`, slotData)
        console.log(response)
        return response.data.data
    } catch (error) {
        console.log(error)
    }
}

const getSlot = async () => {
    try {
        let response = await API.get(`/doctor/get_slots/${doctorId}`)
        console.log(response)
        return response?.data.data
    } catch (error) {
        console.log(error)
    }
}

const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    console.log(newStatus)
    try {
        let response = await API.patch(`/doctor/update_status/${appointmentId}`, { status: newStatus })
        console.log(response)
        if (response) {
            return response?.data.data
        }
    } catch (error: any) {
        console.log(error)
    }
}

const createPrescription = async (prescriptionData: IPresscription) => {
    try {
        let response = await API.post(`/doctor/prescription/${doctorId}`, prescriptionData)
        console.log(response)
        return response.data.data
    } catch (error: any) {
        console.log(error)
    }
}

const getPrescription=async (appointmentId:string)=>{
    try {
        let response=await API.get(`/doctor/prescription/${appointmentId}`)
        console.log(response)
        return response.data.data
    } catch (error) {
       console.log(error)  
    }
}

const getDashboard=async ()=>{
    try {
        let response= await API.get(`/doctor/dashboard/${doctorId}`)
        let summary=response.data.data.summary;
        let todaysAppointment=response.data.data.todaysAppointments
        return {summary,todaysAppointment}
    } catch (error) {
        console.log("Error",error)
    }
}

const getReviews=async ()=>{
  try {
      let response=await API.get(`/doctor/reviews/${doctorId}`)
       console.log(response)
       return response.data
  } catch (error) {
    console.log("Error",error)
  }
}

export { sendOtp, verifyOtp, resendOtp, getDoctor, updateDoctor, googleAuth, getDoctorAppointment, generateSlot, getSlot, updateAppointmentStatus, createPrescription ,getPrescription,getDashboard,getReviews}


