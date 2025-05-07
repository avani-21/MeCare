import { inject,injectable } from "inversify";
import { ISlot } from "../models/slot/slotInterface";
import TYPES from "../di/types";
import { Document, Model } from "mongoose";
import { startOfDay } from 'date-fns';
import SlotModel from "../models/slot/slotModel";
import { BaseRepository } from "./baseRepositry";
import { SlotRepo } from "../interfaces/slot.repo";
import mongoose from "mongoose";
import { ISlotDTO } from "../types/types";


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

      async getAllSlotsByDoctor(doctorId:string):Promise<ISlot[] | null>{
        const today=startOfDay(new Date())
         return await SlotModel.find({doctorId:doctorId,date:{$gte:today}}).exec()
      }
      
}