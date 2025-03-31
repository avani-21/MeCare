import { injectable, inject } from "inversify";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtHelper";
import sendOtpEmail from "../utils/emailService";
import { IPatientService } from "../interfaces/paatient.service";
import { IPatient } from "../models/patient/patientInterface";
import { IPatientRepository } from "../interfaces/patient.repository";
import TYPES from "../di/types";
import logger from "../utils/logger";

dotenv.config();

@injectable()
class PatientService implements IPatientService {
  constructor(@inject(TYPES.PatientRepository) private patientRepository: IPatientRepository) {}

  async registerPatient(name: string, email: string, password: string, confirmPassword: string) {
    logger.debug("Attempting to register patient:",email)
    if (password !== confirmPassword) {
      logger.warn("Password do not match")
      throw new Error("Passwords do not match");
    }

    const existingPatient = await this.patientRepository.findByEmail(email);
    if (existingPatient) {
      logger.warn("Email alredy in use")
      throw new Error("Email already in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);
    logger.debug("creating a new pateint account")
    const newPatient = await this.patientRepository.create({
      name,
      email,
      password: hashPassword,
      isVerified: false,
      otp,
      otpExpiration: otpExpiresAt,
    });

  logger.info("Sending otp to the  registered mail",email)
    await sendOtpEmail(email, otp);
    return { message: "Patient registered successfully, OTP sent for verification.", patientId: newPatient._id };
  }

  async verifyOtp(email: string, otp: string) {
    logger.debug(`Verifying OTP for ${email}`);
    const patient = await this.patientRepository.findByEmail(email);
    if (!patient) {
      logger.warn(`OTP verification attempt for non-existent patient: ${email}`);
      throw new Error("Patient not found");
    }

    if (patient.otp !== otp) {
      logger.warn(`Invalid OTP attempt for ${email}`);
      throw new Error("Invalid OTP");
    }
    logger.info(`Patient verified successfully: ${email}`);
    await this.patientRepository.verifyAndUpdatePatient(email);
    return { message: "OTP verified successfully. You can now log in." };
  }

  async resendOtp(email: string) {
    logger.debug(`Resending OTP to ${email}`);
    const patient = await this.patientRepository.findByEmail(email);
    if (!patient) {
      logger.warn(`OTP resend attempt for non-existent patient: ${email}`);
      throw new Error("Patient not found");
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.patientRepository.update(patient._id.toString(), { otp: newOtp });
    await sendOtpEmail(email, newOtp);
    logger.info(`OTP resent successfully to ${email}`);
    return { message: "New OTP sent successfully" };
  }

  async loginPatient(email: string, password: string) {
    logger.debug(`Login attempt for patient: ${email}`);
    const patient: IPatient | null = await this.patientRepository.findByEmail(email);
    if (!patient) {
      logger.warn(`Login attempt for non-existent patient: ${email}`);
      throw new Error("Patient not found");
    }

    if (!patient.isVerified) {
      logger.warn(`Unverified patient login attempt: ${email}`);
      throw new Error("Please verify your account via OTP");
    }

    const isValidPassword = await bcrypt.compare(password, patient.password);
    if (!isValidPassword) {
      logger.warn(`Invalid password attempt for: ${email}`);
      throw new Error("Invalid credentials");
    }

    const accessToken = generateAccessToken(patient._id.toString(),patient.email, "patient");
    const refreshToken = generateRefreshToken(patient._id.toString(),patient.email, "patient");
    logger.info(`Patient logged in successfully: ${email}`);

    return { accessToken, refreshToken, patientId: patient._id };
  }

  async googleAuth(googleId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
    let patient = await this.patientRepository.findByEmail(email);
    logger.debug(`Google auth attempt for: ${email}`);
    if (!patient) {
      logger.debug(`Creating new patient via Google auth: ${email}`);
      const defaultPassword = "Google@123";
      const hashPassword = await bcrypt.hash(defaultPassword, 10);

      patient = await this.patientRepository.create({
        email,
        googleId,
        password: hashPassword,
        isVerified: true,
      });
    } else if (!patient.googleId) {
      logger.debug(`Linking Google ID to existing patient: ${email}`);
      await this.patientRepository.update(patient._id.toString(), { googleId });
      patient = await this.patientRepository.findByEmail(email);
    }

    if (!patient) {
      logger.error("Failed to create or update patient via Google auth");
      throw new Error("Failed to create or update patient.");
    }

    const accessToken = generateAccessToken(patient._id.toString(), patient.email,"patient");
    const refreshToken = generateRefreshToken(patient._id.toString(),patient.email, "patient");
    logger.info(`Google auth successful for: ${email}`)
    return { accessToken, refreshToken };
  }
}

export default PatientService;
