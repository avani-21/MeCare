import { inject,injectable } from "inversify";
import TYPES from "../di/types";
import { IDoctor } from "../models/doctor/doctorInterface";
// import { DoctorRepository } from "../repositories/doctorRepository";
import { IDoctorService } from "../interfaces/doctorService";
import { IDoctorRepo } from "../interfaces/doctor.repo";
import sendOtpEmail from "../utils/emailService";
import cloudinary from "../config/cloudinary.config";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtHelper";
import logger from "../utils/logger";

@injectable()
 class DoctorService implements IDoctorService{
   constructor(@inject(TYPES.DoctorRepository) private doctorRepository:IDoctorRepo ){}

  

   async sendOtp(email: string): Promise<string> {
    logger.debug(`Sending OTP to ${email}`);

     const doctor=await this.doctorRepository.findDoctor(email)
     if(!doctor){
      logger.warn(`Doctor not found for email: ${email}`);
      throw new Error("Doctor not found")
     }

     if (!doctor.isApproved) {
      logger.warn(`Unapproved doctor attempted OTP request: ${email}`);
      throw new Error("Doctor is not approved. Cannot send OTP.");
    }
    
     const otp = Math.floor(100000 + Math.random() * 900000).toString();
     console.log("OTP",otp)
     const otpExpiration = new Date(Date.now() + 1 * 60 * 1000);

     await this.doctorRepository.updateOtp(email,otp,otpExpiration);
     await sendOtpEmail(email,otp)
     logger.info(`OTP sent successfully to ${email}`);
     return "OTP sent successfully.";
   }

   async verifyOtp(email: string, otp: string) {
    const doctor = await this.doctorRepository.findDoctor(email);
    if (!doctor) {
      logger.warn(`Doctor not found during OTP verification: ${email}`);
      throw new Error("Doctor not found");
    }
  
    if (doctor.otp !== otp) {
      logger.warn(`Invalid OTP attempt for ${email}`);
      throw new Error("Invalid or expired OTP");
    }
  
    await this.doctorRepository.verifyDoctor(email);
    
   
    if (!doctor.id) {
      logger.error("Doctor ID missing during token generation", { email });
      throw new Error("Doctor ID is missing");
    }
    
    const id = doctor.id.toString();
    const role = "doctor"; 
  
    console.log(`Generating tokens for ID: ${id}, Email: ${doctor.email}, Role: ${role}`);
  
    try {
      const accessToken = generateAccessToken(id, doctor.email, role);
      const refreshToken = generateRefreshToken(id, doctor.email, role);
  
      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);
  
      if (!refreshToken) {
        logger.error("Refresh token generation failed", { doctorId: id });
        throw new Error("Refresh token generation failed");
      }
  
      return {
        message: "OTP verified successfully. Redirecting to dashboard.",
        id: id,
        refreshToken,
        accessToken
      };
    } catch (error) {
      console.error("Token generation error:", error);
      logger.error(`OTP verification failed for ${email}`);
      throw new Error("Failed to generate tokens");
    }
  }

   async resendOtp(email: string): Promise<string> {
    logger.debug(`Resending OTP to ${email}`);
     return await this.sendOtp(email)
   }

   async updateData(doctorId: string, updateData: Partial<IDoctor>, image?: Express.Multer.File): Promise<IDoctor | null> {
    try {
      logger.debug(`Updating doctor data for ${doctorId}`);
      let imageUrl = updateData.profileImg;

      if (image) {
        logger.debug(`Uploading image for doctor ${doctorId}`);
        const cloudinaryResult = await cloudinary.uploader.upload(image.path, {
          folder: "doctor-profiles",
        });
        imageUrl = cloudinaryResult.secure_url;
      }


      const updatedDoctor = await this.doctorRepository.updateDoctor(doctorId, {
        ...updateData,
        profileImg: imageUrl,
      });
      logger.info(`Doctor data updated successfully for ${doctorId}`);
      return updatedDoctor; 
    } catch (error: any) {
      logger.error(`Error updating doctor ${doctorId}`, { error: error.stack });
      console.error("Error updating doctor:", error);
      throw error;
    }
  }

  async getDoctor(id: string): Promise<IDoctor | null> {
    logger.debug(`Fetching doctor with ID: ${id}`);
     return await this.doctorRepository.getDoctorById(id)
  }

  async googleAuth(email: string): Promise<void> {
    logger.debug(`Processing Google auth for ${email}`);
    await this.sendOtp(email)
  }


  async getApprovedDoctors(
    page: number = 1,
    limit: number = 3,
    filters?: {
      specialization?: string;
      gender?: string;
      experience?: number;
        searchQuery?: string;
    }
  ): Promise<{ doctors: IDoctor[]; total: number }> {

  let result= await this.doctorRepository.getApprovedDoctors(page, limit,filters);
  console.log("result",result)
  return result
}
   
}

export default DoctorService