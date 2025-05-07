import mongoose from "mongoose";
import { IPrescription } from "./priscriptionInterface";
import prescriptionSchema from "./prescriptionSchema";

const PrescriptioModel=mongoose.model<IPrescription>('Prescription',prescriptionSchema)

export default PrescriptioModel;