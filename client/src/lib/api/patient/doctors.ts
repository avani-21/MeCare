import API from "@/lib/axiosInstane";


const getDoctors = async (
  page: number,
  limit: number = 3,
  specialization?: string,
  gender?: string,
  experience?: number,
  searchQuery?: string
) => {
  try {
    const response = await API.get("/patient/doctors", {
      params: {
        page,
        limit,
        ...(specialization && { specialization }), 
        ...(gender && { gender }),
        ...(experience && { experience }),
        ...(searchQuery && { searchQuery }) 
      }
    });

 
    return {
      doctors: response.data.data,
      total: response.data.data.meta.total
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message);
  }
};  

const getSingleDoctor=async (id:string)=>{
    try {
        let response=await API.get(`/patient/doctors/${id}`)
        return response
    } catch (error:any) {
        throw new Error(error.response?.data?.error || error.message)
    }
}

const getSlots=async (id:string)=>{
    try {
          let response=await API.get(`/patient/doctors/slot/${id}`)
          return response
    } catch (error:any) {
        throw new Error(error?.response?.data?.message || error.message)
    }
}

const getPrescription=async (appointmentId:string)=>{
  try {
      let response=await API.get(`/patient/prescription/${appointmentId}`)
      return response.data.data
  } catch (error) {
     console.log(error)  
  }
}



export {getDoctors,getSingleDoctor,getSlots,getPrescription}