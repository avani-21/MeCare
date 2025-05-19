import { Types } from "mongoose";
import { ISlot } from "../models/slot/slotInterface";
import { RRule } from "rrule";

export interface SlotRepo {
  generateSlots(slotsData: Partial<ISlot>[]): Promise<ISlot[]> ;
  createSlot(slotData:Partial<ISlot>):Promise<ISlot>;
  findSlotByDoctor(doctorId: string | Types.ObjectId): Promise<ISlot[]>;
  findById(id:string):Promise<ISlot | null>
  markSlotAsBooked(slotId: string): Promise<void>;
  getAllSlotsByDoctor(doctorId:string,page:number,limit:number,startDate?:Date,endDate?:Date):Promise<{slots:ISlot[] | null,total:number}>;
  editSlot(slotId:string,slotData:ISlot):Promise<ISlot | null>
  cancelSlot(slotId:string):Promise<ISlot | null>
    generateRecurringSlots(recurringData: {
        doctorId: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
        interval: number;
        weekdays?: number[];
    }): Promise<ISlot[]>;
}