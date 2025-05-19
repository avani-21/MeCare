import { ISlot } from "../models/slot/slotInterface";

export interface ISlotService{
  generateSlots(slotsData: Omit<ISlot, keyof Document>[]): Promise<ISlot[]>;
  getSlotsByDoctor(doctorId: string): Promise<ISlot[]>;
  createSlot(slotData:Partial<ISlot>):Promise<ISlot>;
 getAllSlotByDoctor(doctorId:string,page:number,limit:number,startDate?:Date,endDate?:Date):Promise<{slots:ISlot[] | null,total:number}>;
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