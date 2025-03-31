import mongoose from "mongoose";
import adminSchema from "./adminSchema";
import { IAdmin } from "./adminInterface";

const AdminModel=mongoose.model<IAdmin>("Admin",adminSchema)

export default AdminModel;