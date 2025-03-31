import mongoose from "mongoose";
import { IDoctor } from "./doctorInterface";
import doctorSchema from "./doctorSchema";

const DoctorModel=mongoose.model<IDoctor>("Doctor",doctorSchema)

export default DoctorModel;