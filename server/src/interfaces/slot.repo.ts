import { Types } from "mongoose";
import { ISlot } from "../models/slot/slotInterface";

export interface SlotRepo {
  generateSlots(slotsData: Partial<ISlot>[]): Promise<ISlot[]> ;
  createSlot(slotData:Partial<ISlot>):Promise<ISlot>;
  findSlotByDoctor(doctorId: string | Types.ObjectId): Promise<ISlot[]>;
  findById(id:string):Promise<ISlot | null>
  markSlotAsBooked(slotId: string): Promise<void>;
  getAllSlotsByDoctor(doctorId:string):Promise<ISlot[] | null>;
}