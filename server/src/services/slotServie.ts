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

async getAllSlotByDOctor(doctorId: string): Promise<ISlot[] | null> {
    return await this._slotRepository.getAllSlotsByDoctor(doctorId)
}

}