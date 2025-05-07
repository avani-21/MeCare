
import mongoose from "mongoose";
import { ISlot } from "./slotInterface";
import SlotSchema from "./slotSchema";

const SlotModel=mongoose.model<ISlot>("Slot",SlotSchema)

export default SlotModel