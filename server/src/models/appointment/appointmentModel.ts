import { IAppointment } from "./appointmentInterface";
import AppointmentSchema from "./appointmentSchems";
import mongoose from "mongoose";

const AppointmentModel=mongoose.model<IAppointment>("Appointment",AppointmentSchema)

export default AppointmentModel