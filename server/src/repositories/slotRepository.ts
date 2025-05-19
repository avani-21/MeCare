import { inject,injectable } from "inversify";
import { ISlot } from "../models/slot/slotInterface";
import TYPES from "../di/types";
import { Document, Model } from "mongoose";
import { endOfDay, startOfDay } from 'date-fns';
import SlotModel from "../models/slot/slotModel";
import { BaseRepository } from "./baseRepositry";
import { SlotRepo } from "../interfaces/slot.repo";
import mongoose from "mongoose";
import { ISlotDTO } from "../types/types";
import logger from "../utils/logger";
import { RRule } from 'rrule';


@injectable()
export class SlotRepository extends BaseRepository<ISlot> implements SlotRepo {
    constructor(@inject(TYPES.SlotModel) slotModel: Model<ISlot>) {
      super(slotModel);
    }



    async generateSlots(slotsData: ISlotDTO[]): Promise<ISlot[]> {
        try {
          const insertedSlots = await SlotModel.insertMany(slotsData);
          return insertedSlots;
        } catch (error) {
          console.error('Error generating slots:', error);
          throw new Error('Failed to generate slots');
        }
      }

      async createSlot(slotData: Partial<ISlot>): Promise<ISlot> {
        const { doctorId, date, startTime, endTime } = slotData;
      
        if (!doctorId || !date || !startTime || !endTime) {
          throw new Error("All fields are required");
        }
      
        const slotDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        slotDate.setHours(0, 0, 0, 0);
      
        if (slotDate.getTime() === today.getTime()) {
          const now = new Date();
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const slotStartDateTime = new Date(date);
          slotStartDateTime.setHours(startHour, startMinute, 0, 0);
      
          if (slotStartDateTime <= now) {
            throw new Error("Start time must be greater than the current time");
          }
        }
      
        const existingSlot = await SlotModel.findOne({
          doctorId,
          date,
          $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
            { startTime, endTime }
          ]
        });
      
        if (existingSlot) {
          throw new Error("The doctor already has a slot at the given date and time");
        }
      
        return await SlotModel.create(slotData);
      }
      
      async findSlotByDoctor(doctorId: string): Promise<ISlot[]> {
      
        try {
            const slots = await SlotModel.find({
                doctorId: new mongoose.Types.ObjectId(doctorId), // Use parameter, not hardcoded value
                isBooked: false
            })
            .populate('doctorId') 
            .sort({ startTime: 1 })
            .exec(); // Don't forget to execute the query
            
            console.log("Found slots:", slots);
            return slots;
        } catch (error) {
            console.error('Error finding slots:', error);
            throw error;
        }
      }

      async findById(id: string): Promise<ISlot | null> {
         return await SlotModel.findById(id)
      }
      
      async markSlotAsBooked(slotId: string): Promise<void> {
        try {
          await SlotModel.findByIdAndUpdate(
            slotId,
            { isBooked: true, isAvailable: false }, 
            { new: true }
          );
        } catch (error) {
          console.error('Error marking slot as booked:', error);
          throw new Error('Failed to update slot booking status');
        }
      }

async getAllSlotsByDoctor(doctorId: string, page: number = 1, limit: number = 10,startDate?:Date,endDate?:Date): Promise<{slots: ISlot[] | null, total: number}> {
  
    const skip = (page - 1) * limit;

    const baseQuery:any={doctorId:doctorId}

    if(startDate && endDate){
      baseQuery.date={
        $gte:startOfDay(startDate),
        $lte:endOfDay(endDate)
      }
    }else if(startDate){
      baseQuery.date={
        $gte:startOfDay(startDate)
      }
    }else{
      baseQuery.date={
        $gte:startOfDay(new Date())
      }
    }

    const [slots, total] = await Promise.all([
        SlotModel.find(baseQuery)
        .sort({ date: 1 }) 
        .skip(skip)
        .limit(limit)
        .exec(),
        
        SlotModel.countDocuments(baseQuery)
    ]);
    
    return { slots, total };
}

      async editSlot(slotId: string, slotData: ISlot): Promise<ISlot | null> {
         const updatedSlots=await SlotModel.findByIdAndUpdate(
          slotId,
          {$set:slotData},
          {new:true}
         )

         if(!updatedSlots){
          logger.error("Slot not fount")
           throw new Error("Slot not found")
         }
         return updatedSlots
      }

      async cancelSlot(slotId: string): Promise<ISlot | null> {
         const cancelSlot=await SlotModel.findByIdAndDelete(slotId)
          
         if(!cancelSlot){
            logger.error("Slot not fount")
          throw new Error("Slot not fount")
         }
         return cancelSlot
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
        const { doctorId, startDate, endDate, startTime, endTime, frequency, interval, weekdays } = recurringData;
        
       
        if (!doctorId || !startDate || !endDate || !startTime || !endTime) {
            throw new Error("All fields are required");
        }

       
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            throw new Error("Invalid time format. Use HH:MM");
        }

        if (startTime >= endTime) {
            throw new Error("End time must be after start time");
        }

 
        let freq;
        switch (frequency) {
            case 'DAILY':
                freq = RRule.DAILY;
                break;
            case 'WEEKLY':
                freq = RRule.WEEKLY;
                break;
            case 'MONTHLY':
                freq = RRule.MONTHLY;
                break;
            default:
                throw new Error('Invalid frequency');
        }

        const byweekday = weekdays?.map(day => {
            switch(day) {
                case 0: return RRule.SU;
                case 1: return RRule.MO;
                case 2: return RRule.TU;
                case 3: return RRule.WE;
                case 4: return RRule.TH;
                case 5: return RRule.FR;
                case 6: return RRule.SA;
                default: return RRule.MO;
            }
        });


        const normalizeDate = (date: Date) => {
            const d = new Date(date);
            d.setHours(12, 0, 0, 0);
            return d;
        };

        const rule = new RRule({
            freq,
            dtstart: normalizeDate(startDate),
            until: normalizeDate(endDate),
            interval,
            byweekday: frequency === 'WEEKLY' ? byweekday : undefined
        });

   
        const dates = rule.all();

    
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pastDates = dates.filter(date => {
            const slotDate = new Date(date);
            slotDate.setHours(0, 0, 0, 0);
            return slotDate < today;
        });

        if (pastDates.length > 0) {
            throw new Error("Cannot create slots for past dates");
        }

    
        const now = new Date();
        const todaySlots = dates.filter(date => {
            const slotDate = new Date(date);
            slotDate.setHours(0, 0, 0, 0);
            return slotDate.getTime() === today.getTime();
        });

        if (todaySlots.length > 0) {
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const slotStartDateTime = new Date(today);
            slotStartDateTime.setHours(startHour, startMinute, 0, 0);

            if (slotStartDateTime <= now) {
                throw new Error("Start time must be greater than the current time for today's slots");
            }
        }

     
        const slotsToCreate = dates.map(date => {
         
            const slotDate = new Date(date);
            slotDate.setHours(0, 0, 0, 0);
            
            return {
                doctorId,
                date: slotDate,
                startTime,
                endTime,
                isBooked: false,
                isAvailable: true
            };
        });

    
        const BATCH_SIZE = 50;
        const conflictingSlots: {date: string, startTime: string, endTime: string}[] = [];

        for (let i = 0; i < slotsToCreate.length; i += BATCH_SIZE) {
            const batch = slotsToCreate.slice(i, i + BATCH_SIZE);
            
            
            const existingSlots = await SlotModel.find({
                doctorId,
                $or: batch.map(slot => ({
                    date: slot.date,
                    $or: [
                       
                        { startTime: { $lt: slot.endTime }, endTime: { $gt: slot.startTime } },
                        
                        { startTime: slot.startTime, endTime: slot.endTime }
                    ]
                }))
            });

            existingSlots.forEach(slot => {
                conflictingSlots.push({
                    date: slot.date.toISOString().split('T')[0],
                    startTime: slot.startTime,
                    endTime: slot.endTime
                });
            });
        }

        if (conflictingSlots.length > 0) {
            const conflictMessage = conflictingSlots
                .map(s => `${s.date} (${s.startTime}-${s.endTime})`)
                .join(', ');
            throw new Error(`Conflicting slots found: ${conflictMessage}`);
        }

  
        const insertedSlots: ISlot[] = [];
        for (let i = 0; i < slotsToCreate.length; i += BATCH_SIZE) {
            const batch = slotsToCreate.slice(i, i + BATCH_SIZE);
            const results = await SlotModel.insertMany(batch);
            insertedSlots.push(...results);
        }

        return insertedSlots;
    } catch (error) {
        logger.error('Error generating recurring slots:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to generate recurring slots');
    }
}
      
}