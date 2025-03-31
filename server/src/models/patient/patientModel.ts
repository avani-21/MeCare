import mongoose from "mongoose";
import { IPatient } from "./patientInterface";
import patientSchema from "./patientSchema";

const PatientModel=mongoose.model<IPatient>("Patient",patientSchema)

export default PatientModel;