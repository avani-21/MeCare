import { injectable,inject } from "inversify";
import { ISlotService } from "../interfaces/slot.service";
import TYPES from "../di/types";
import { SlotRepo } from "../interfaces/slot.repo";
import { ISlot } from "../models/slot/slotInterface";
import logger from "../utils/logger";

@injectable()
export class SlotService implements ISlotService{
    constructor(
        @inject(TYPES.SlotRepository) private _slotRepository:SlotRepo
    ){}
    getAllSlotsByDoctor(doctorId: string, page: number, limit: number): Promise<{ slots: ISlot[] | null; total: number; }> {
        throw new Error("Method not implemented.");
    }


     async generateRecurringSlots(recurringData: {
        doctorId: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
        interval: number;
        weekdays?: number[];
    }): Promise<ISlot[]> {
        try {
            // Validate input
            if (!recurringData.doctorId || !recurringData.startDate || !recurringData.endDate || 
                !recurringData.startTime || !recurringData.endTime || !recurringData.frequency) {
                throw new Error("Missing required fields for recurring slots");
            }

            if (recurringData.startDate >= recurringData.endDate) {
                throw new Error("End date must be after start date");
            }

            if (recurringData.frequency === 'WEEKLY' && (!recurringData.weekdays || recurringData.weekdays.length === 0)) {
                throw new Error("Weekdays must be specified for weekly frequency");
            }

            return await this._slotRepository.generateRecurringSlots(recurringData);
        } catch (error: any) {
            logger.error("Failed to generate recurring slots: " + error.message);
            throw error;
        }
    }

    async generateSlots(slotsData: Omit<ISlot, keyof Document>[]): Promise<ISlot[]> {
        try {
            return await this._slotRepository.generateSlots(slotsData)
        } catch (error:any) {
            logger.error("Failed to create slots")
            throw new Error("Failed to create slots") 
        }
    }

    async createSlot(slotData: Partial<ISlot>): Promise<ISlot> {
        return await this._slotRepository.createSlot(slotData)
    }

  
async getSlotsByDoctor(doctorId: string): Promise<ISlot[]> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const slots = await this._slotRepository.findSlotByDoctor(doctorId);
        
        if (!slots || slots.length === 0) {
            logger.warn(`No slots found for doctor ${doctorId}`);
            throw new Error("No slots found");
        }


        const upcomingSlots = slots.filter(slot => {
            const slotDate = new Date(slot.date);
            return slotDate > today;
        });

        if (upcomingSlots.length === 0) {
            logger.warn(`No upcoming slots found for doctor ${doctorId}`);
            throw new Error("No upcoming slots available");
        }

        logger.info(`Fetched ${upcomingSlots.length} upcoming slots for doctor ${doctorId}`);
        return upcomingSlots;
    } catch (error) {
        logger.error("Failed to fetch slots", error);
        throw new Error("Failed to fetch slots");
    }
}

async checkSlotAvailability(slotId: string): Promise<boolean> {
        const slot = await this._slotRepository.findById(slotId);
        if (!slot || slot.isBooked || !slot.isAvailable) {
          return false;
        }
        return true;
      }

async getAllSlotByDoctor(doctorId:string,page:number,limit:number,startDate?:Date,endDate?:Date):Promise<{slots:ISlot[] | null,total:number}>{
    const slots= await this._slotRepository.getAllSlotsByDoctor(doctorId,page,limit,startDate,endDate)
    console.log("slots",slots)
    return slots
}

async editSlot(slotId: string, slotData: ISlot): Promise<ISlot | null> {
    return await this._slotRepository.editSlot(slotId,slotData)
}

async cancelSlot(slotId: string): Promise<ISlot | null> {
    return await this._slotRepository.cancelSlot(slotId)
}

}