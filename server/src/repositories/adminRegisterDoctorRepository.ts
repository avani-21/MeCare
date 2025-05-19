import { injectable } from "inversify";
import DoctorModel from "../models/doctor/doctorModel";
import { IDoctor } from "../models/doctor/doctorInterface";
import { IDocRegRepo } from "../interfaces/register.doctor.repo";
import PatientModel from "../models/patient/patientModel";
import { IPatient } from "../models/patient/patientInterface";
import mongoose from "mongoose";
import { ISlot } from "../models/slot/slotInterface";
import SlotModel from "../models/slot/slotModel";

@injectable()
export class AdminDoctorRepository implements IDocRegRepo {

    async createDoctor(data: IDoctor): Promise<IDoctor> {
      const newDoctor = new DoctorModel(data);
      return await newDoctor.save();
    }

    async saveSlots(doctorId: string, slots: ISlot[]): Promise<void> {
   
      const formattedSlots = slots.map(slot => ({
        ...slot,
        date: new Date(slot.date),
        doctorId: new mongoose.Types.ObjectId(doctorId)
      }));
      
      await SlotModel.insertMany(formattedSlots);
    }

    async findDoctorByEmail(email: string): Promise<IDoctor | null> {
        return await DoctorModel.findOne({ email }); 
    }

    async findDoctorByID(id: string): Promise<IDoctor | null> {
        return await DoctorModel.findById(id);
    }

    async updateDoctor(id: string, update: Partial<IDoctor>): Promise<IDoctor | null> {
        return await DoctorModel.findByIdAndUpdate(id, update, { new: true }); // Update doctor
    }

    async toggleDoctorApproval(id: string): Promise<IDoctor | null> {
        const doctor = await DoctorModel.findById(id);
        if (!doctor) {
            return null; 
        }
        doctor.isApproved = !doctor.isApproved; 
        return await doctor.save();
    }

    async getPatient(page: number = 1, limit: number = 10): Promise<{ patients: IPatient[], total: number }> {
        const skip = (page - 1) * limit;
        const [patients, total] = await Promise.all([
            PatientModel.find().skip(skip).limit(limit),
            PatientModel.countDocuments()
        ]);
        return { patients, total };
    }

    async findAllDoctors(
        page: number = 1,
        limit: number = 10,
        filters: { specialization?: string }
      ): Promise<{ doctors: IDoctor[]; total: number }> {
        const skip = (page - 1) * limit;
        const query: any = {};
      
        if (filters.specialization) {
          query.specialization = { 
            $regex: `^${filters.specialization}$`, 
            $options: 'i' 
          };
        }
      
      
        const [doctors, total] = await Promise.all([
          DoctorModel.find(query).skip(skip).limit(limit).lean(),
          DoctorModel.countDocuments(query)
        ]);
      
        return { doctors, total };
      }
    
}
