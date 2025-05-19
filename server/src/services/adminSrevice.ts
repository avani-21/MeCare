import { injectable, inject } from "inversify";
import { IAdminRepo } from "../interfaces/admin.repo";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IAdmin } from "../models/admin/adminInterface";
import TYPES from "../di/types";
import { IAdminService } from "../interfaces/admin.service";  
import { generateAccessToken,generateRefreshToken } from "../utils/jwtHelper";
import logger from "../utils/logger"
import { IPatient } from "../models/patient/patientInterface";

@injectable()
class AdminService implements IAdminService { 
  constructor(@inject(TYPES.AdminRepository) private adminRepository: IAdminRepo) {}

  async loginAdmin(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {  
    logger.debug(`Attempting admin login for email: ${email}`);
    const admin: IAdmin | null = await this.adminRepository.findByEmail(email);
    if (!admin) {
      logger.warn(`Admin login failed - email not found: ${email}`);
      throw new Error("Admin not found");
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      logger.warn(`Admin login failed - invalid password`);
      throw new Error("Invalid password");
    }
    const accessToken = generateAccessToken(admin.id, admin.email, "admin");
    const refreshToken = generateRefreshToken(admin.id, admin.email, "admin");
    logger.info(`Admin login successful for: ${email}`);
    return { accessToken, refreshToken };
  }

  async togglePatientStatus(patientId: string): Promise<IPatient | null> {
    return await this.adminRepository.togglePatientStatus(patientId)
  }
}

export default AdminService;
