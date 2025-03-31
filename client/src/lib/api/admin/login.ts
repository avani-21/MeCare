import API from "@/lib/axiosInstane";
import { IAdminLogin } from "@/type/admin";

const adminLogin=async (data:IAdminLogin)=>{
try {
    let response=await API.post("admin/admin_login",data);
    return response.data
} catch (error:any) {
    console.log(error)
    throw new Error(error?.response?.data?.message)
}
}

export {adminLogin}