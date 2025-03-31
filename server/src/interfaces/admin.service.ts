import { IAdmin } from "../models/admin/adminInterface";

export interface IAdminService{
    loginAdmin(email:string,password:string):Promise<{
        accessToken:string;
        refreshToken:string;
    }>
}