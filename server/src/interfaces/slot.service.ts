import { ISlot } from "../models/slot/slotInterface";

export interface ISlotService{
  generateSlots(slotsData: Omit<ISlot, keyof Document>[]): Promise<ISlot[]>;
  getSlotsByDoctor(doctorId: string): Promise<ISlot[]>;
  createSlot(slotData:Partial<ISlot>):Promise<ISlot>;
  getAllSlotByDOctor(doctorId:string):Promise<ISlot[] | null>
}