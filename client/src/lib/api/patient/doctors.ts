import API from "@/lib/axiosInstane";
const getDoctors = async (
    page: number,
    limit: number = 3,
    specialization: string, // Corrected the spelling to match backend
    gender: string,
    experience: number // Corrected the spelling to match backend
  ) => {
    try {
      const response = await API.get("/patient/doctors", {
        params: {
          page,
          limit,
          specialization, 
          gender,
          experience 
        }
      });
  
      console.log("Doctor data:", response.data.data);
      console.log("Total:", response.data.data.meta.total);
  
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
        console.log(response)
        return response
    } catch (error:any) {
        throw new Error(error.response?.data?.error || error.message)
    }
}

const getSlots=async (id:string)=>{
    try {
          let response=await API.get(`/patient/doctors/slot/${id}`)
          console.log(response)
          return response
    } catch (error:any) {
        throw new Error(error?.response?.data?.message || error.message)
    }
}

const getPrescription=async (appointmentId:string)=>{
  try {
      let response=await API.get(`/patient/prescription/${appointmentId}`)
      console.log(response)
      return response.data.data
  } catch (error) {
     console.log(error)  
  }
}



export {getDoctors,getSingleDoctor,getSlots,getPrescription}