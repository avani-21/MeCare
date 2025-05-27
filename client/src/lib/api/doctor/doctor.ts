import API from "@/lib/axiosInstane";
import { IPresscription, SlotFormData } from "@/type/doctor";
import { IMessage, ISlot } from "@/type/patient";
import { error } from "console";
import { get } from "http";
import { string } from "yup";
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
       
        localStorage.setItem("doctorId", response.data.id)
        localStorage.setItem("doctorToken",response.data.accessToken)
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
        return response.data.data
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const updateDoctor = async (doctorId: string, formData: FormData) => {
    try {
       
        let result = await API.put(`/doctor/profile/${doctorId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })

     
        return result

    } catch (error: any) {
        throw new Error(error?.response?.data.message || error.message)
    }
}

const getDoctorAppointment = async (
  page: number,
  limit: number,
  filterStatus: string = 'all',
  startDate?: string,
  endDate?: string,
  searchQuery?:string,
) => {
  try {
    const response = await API.get(`/doctor/my_appointment`, {
      params: {
        page,
        limit,
        status: filterStatus,  
       ...(searchQuery && { searchQuery: searchQuery.trim() }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      }
    });
  
    return response.data;
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

const generateSlot = async (slotData: SlotFormData) => {
    try {
        let response = await API.post(`/doctor/create_slot/${doctorId}`, slotData)
 
        return response.data.data
    } catch (error) {
        console.log(error)
    }
}

const getSlot = async (doctorId: string, page: number, limit: number, startDate?: Date, endDate?: Date) => {
    try {
        const params: any = {
            page,
            limit
        };
        
        if (startDate) {
            params.startDate = startDate.toISOString();
        }
        if (endDate) {
            params.endDate = endDate.toISOString();
        }

        let response = await API.get(`/doctor/get_slots/${doctorId}`, {
            params
        });
        return response?.data.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
   
    try {
        let response = await API.patch(`/doctor/update_status/${appointmentId}`, { status: newStatus })
       
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
      
        return response.data.data
    } catch (error: any) {
        console.log(error)
    }
}

const getPrescription = async (appointmentId: string) => {
    try {
        let response = await API.get(`/doctor/prescription/${appointmentId}`)

        return response.data.data
    } catch (error) {
        console.log(error)
    }
}

const getDashboard = async (doctorId:string) => {
    try {
        let response = await API.get(`/doctor/dashboard/${doctorId}`)
        let summary = response.data.data.summary;
        let todaysAppointment = response.data.data.todaysAppointments
        return { summary, todaysAppointment }
    } catch (error) {
        console.log("Error", error)
    }
}

const getReviews = async () => {
    try {
        let response = await API.get(`/doctor/reviews/${doctorId}`)
        
        return response.data
    } catch (error) {
        console.log("Error", error)
    }
}


const sendMessage = async (messageData: IMessage) => {
    try {
        let response = await API.post(`/doctor/send_message`, messageData)
        
        return response.data
    } catch (error) {
        console.log("Error", error)
    }
}

const getConversation = async (user1Id: string) => {
    try {
        const response = await API.get(`/doctor/get_conversation/${user1Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching conversation:', error);
        throw error;
    }
};

const getPatientByDoctors = async () => {
    try {
        const response = API.get(`/doctor/get_patients`)
        return response
    } catch (error) {
        console.log(error)
    }
}

const logOut = async () => {
    try {
        document.cookie = 'DoctorToken=;  expires=Thu, 01 Jan 1970 00:00:00 GMT'
        localStorage.removeItem("doctorToken")
        localStorage.removeItem("doctorId")

    } catch (error) {
        console.error('Logout error:', error)
        return null
    }
}

const editSlot=async (slotId:string,slotData:SlotFormData)=>{
    try {
        let response=await API.patch(`/doctor/slot_edit/${slotId}`,slotData)
        if(response){
            return response.data.data
        }
    } catch (error) {
         console.log(error)
    }
}

const deleteSlot=async (slotId:string)=>{
    try {
        let response=await API.patch(`/doctor/slot_cancel/${slotId}`,{})
        if(response){
            return response.data.data
        }
    } catch (error) {
        
    }
}

export const generateRecurringSlots = async (data: {
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  weekdays?: number[];
}) => {
  try {
    const response = await API.post('/doctor/recurring_slot', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


const getUnredMessageCount = async (receiverId: string): Promise<number> => {
  try {
    const response = await API.get(`/doctor/get_unread_message_count/${receiverId}`);
    return response?.data?.data || 0;
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    throw error;
  }
};

const getMessageMark = async (receiverId: string): Promise<any> => {
  try {
    const response = await API.put(`/doctor/mark_read/${receiverId}`, {});
    return response?.data?.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};


export { sendOtp, verifyOtp, resendOtp, getDoctor, updateDoctor, googleAuth, getDoctorAppointment, generateSlot, getSlot, updateAppointmentStatus, createPrescription, getPrescription, getDashboard, getReviews, getPatientByDoctors, getConversation, sendMessage ,editSlot,deleteSlot,logOut,getUnredMessageCount,getMessageMark}


