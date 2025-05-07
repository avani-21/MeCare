import { IAppointment } from "./patient";

export interface IAdminLogin{
    email:string;
    password:string
}

export interface DashboardData {
    
      doctors: number
      patients: number
      appointments: number
       profit:number
   
  }

  export interface ProfitData {
    data: ProfitDataResponse;
  }

  export interface ProfitDataResponse {
    labels: string[]
    data: number[]
    total: number
  }
  
  