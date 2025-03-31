import { IDoctor } from "@/components/adminComponents/admin.doctor.list";
import API from "@/lib/axiosInstane";

const registerDoctor=async (formData:FormData)=>{
    try{
      const response=await API.post("/admin/add_doctor",formData,{
        headers:{"Content-Type":"multipart/form-data"},
        
      })

      console.log(response)
      return response
    }catch(error:any){
       throw new Error(error?.response?.data.message || error)
    }
}

const listDoctor=async (page:number=1,limit:number=10,filters?:{specialization?:string;})=>{
  try{
   const response=await API.get("/admin/all_doctors",{
    params:{
      page,
      limit,
      specialization: filters?.specialization,
    }
   })
   console.log(response)
   return {
    doctors:response.data.data.data,
    total:response.data.data.meta.total
   }
  }catch(error:any){
    throw new Error(error.response?.data?.message || "Error occured during fetching doctor data")
  }
}

const editDoctor=async (id:string,doctorData:IDoctor)=>{
  try {
     const response=await API.put(`/admin/doctor/${id}`,doctorData)
     console.log(response)
     return response
  } catch (error:any) {
    throw new Error(error.response?.data?.message || "Error occured during fetching doctor data")
  }
}

const toggleApprovelStatus=async (id:string)=>{
 try {
  const response=await API.patch(`/admin/doctor/toggle_approval/${id}`)
  return response
 } catch (error:any) {
    throw new Error(error?.response?.data?.message || "Error occured during the toogle approve status")
 }
}

const getPatients=async (page:number=1,limit:number=10)=>{
  try {
    const response=await API.get("/admin/patients",{
      params:{
        page,limit
      }
    })
    console.log("ppp",response.data)
    return {
      patients: response.data.data.data,
      total: response.data.data.meta.total
    };
  } catch (error:any) {
    throw new Error(error.response?.data?.message || "Error occured during fetching patient data")
  }
}

export {registerDoctor,listDoctor,editDoctor,toggleApprovelStatus,getPatients}