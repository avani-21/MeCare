import API from "@/lib/axiosInstane";

const getDoctors=async ()=>{
    try {
        const response=await API.get("/patient/doctors")
        return response.data
    } catch (error:any) {
        throw new Error(error.response?.data?.error || error.message)
    }
}

export {getDoctors}