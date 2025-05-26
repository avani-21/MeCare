import API from "@/lib/axiosInstane";
import { IAdminLogin } from "@/type/admin";

const adminLogin=async (data:IAdminLogin)=>{
try {
    let response=await API.post("admin/admin_login",data);
    console.log(response.data)
    localStorage.setItem("adminToken",response.data.data.accessToken)
    return response.data
} catch (error:any) {
    console.log(error)
    throw new Error(error?.response?.data?.message)
}
}

const logOut = async () => {
    try {

        document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    } catch (error) {
        console.error('Logout error:', error)
        return null
    }
}

export {adminLogin,logOut}