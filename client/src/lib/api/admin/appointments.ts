import API from "@/lib/axiosInstane";
import { DateRangeParams, ProfitData } from "@/type/admin";
import { IAppointment } from "@/type/patient";
import { DateRange } from "react-big-calendar";

const getAllAppointments=async (page:number,limit:number)=>{
  try {
    const response=await API.get("/admin/appointments",{
        params:{
            page,
            limit
        }
    })
    if(response){
        console.log("All Appointments",response.data.data)
        return response.data.data
    }
  } catch (error:any) {
    console.log("Error",error.message)
    throw new Error("Error occured while fetching appointment data")
  }
}


const getDasshboard=async ()=>{
  try {
    let response=await API.get(`/admin/dashboard`)
    let summary=response.data.data.summary
    let latestAppointments=response.data.data.latestAppointments
    console.log("summary",summary)
    console.log("latest appointments",latestAppointments)
    return {summary,latestAppointments}

  } catch (error:any) {
    console.log(error)
  } 
}

 const getProfitData = async (
  range: 'weekly' | 'monthly' | 'yearly' | 'custom',
  startDate?: Date,
  endDate?: Date
) => {
  try {

    let url = `/admin/profitData?range=${range}`;
 
    if (range === 'custom' && startDate && endDate) {
      url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    }

    const response = await API.get(url);
    return response.data;
    
  } catch (error) {
    console.error('Error fetching profit data:', error);
    throw error;
  }
};

export {getAllAppointments,getDasshboard,getProfitData}