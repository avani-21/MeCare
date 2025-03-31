import { injectable, inject } from "inversify";
import { IDocRegRepo } from "../interfaces/register.doctor.repo";
import { IDoctor } from "../models/doctor/doctorInterface";
import cloudinary from "../config/cloudinary.config";
import mongoose from "mongoose";
import TYPES from "../di/types";
import { IPatient } from "../models/patient/patientInterface";
import logger from "../utils/logger";

@injectable()
class DocRegService {
  constructor(@inject(TYPES.DoctorRegRepository) private doctorRepository: IDocRegRepo) {}

  async registerDoctor(doctorData: Partial<IDoctor>, files: any): Promise<IDoctor> {
    logger.debug(`Registering doctor with email: ${doctorData.email}`);
    const existingDoctor = await this.doctorRepository.findDoctorByEmail(doctorData.email!);
    if (existingDoctor) {
      logger.warn(`Doctor registration attempted with existing email: ${doctorData.email}`);
      throw new Error("Doctor with this email already exists");
    }

    const profileImgUrl = files.profileImg ? await this.uploadToCloudinary(files.profileImg[0]) : null;
    const kycCertificateUrl = files.kycCertificate ? await this.uploadToCloudinary(files.kycCertificate[0]) : null;

    if (!profileImgUrl) {
      throw new Error("Profile image is required!");
    }

    const { _id, ...data } = doctorData;

    const newDoctor: IDoctor = {
      ...data,
      _id: new mongoose.Types.ObjectId().toString(),
      profileImg: profileImgUrl,
      kycCertificate: kycCertificateUrl,
      isVerified: false,
      isApproved: false,
      createdAt: new Date(),
      reviewCount: 0,
      rating: 0,
    } as IDoctor;
    logger.info("Doctor registered successfully")

    return await this.doctorRepository.createDoctor(newDoctor);
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    logger.info("Adding image files to cloudinary")
    const result = await cloudinary.uploader.upload(file.path);
    return result.secure_url;
  }

  async getDoctorByEmail(email: string): Promise<IDoctor | null> {
    logger.info("Fetching doctor by Email",email)
    return await this.doctorRepository.findDoctorByEmail(email);
  }
  async getAllDoctors(
    page:number=1,
    limit:number=10,
    filters:{ specialization?: string;}={}): Promise<{doctors:IDoctor[],total:number}> {
      logger.debug(`Fetching doctors - Page: ${page}, Limit: ${limit}, Filters: ${JSON.stringify(filters)}`);
    return await this.doctorRepository.findAllDoctors(page,limit,filters);
  }

  async updateDoctor(id: string, updatedData: Partial<IDoctor>): Promise<IDoctor | null> {
    logger.info("Updating doctor with Id:",id)
    return await this.doctorRepository.updateDoctor(id, updatedData);
  }

  async toggleDoctorApproval(id: string): Promise<IDoctor | null> {
    logger.info('Toggling approvel status of doctors:',id)
    return await this.doctorRepository.toggleDoctorApproval(id);
  }

  async getPatient(page:number=1,limit:number=10):Promise<{patients:IPatient[],total:number}>{
    logger.debug(`Fetching patients - Page: ${page}, Limit: ${limit}`);
    return await this.doctorRepository.getPatient(page,limit);
  } 

}

export default DocRegService;
