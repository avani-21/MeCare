
import {  Router } from "express";
import TYPES from "../di/types";
import { container } from "../di/container";
import { Request, Response } from "express";
import PatientAuthController from "../controller/patientAuthController";
import DoctorController from "../controller/doctorController";
import authenticatePatient from "../middleware/patientAuthMiddleware";

const router = Router();


const patientController = container.get<PatientAuthController>(TYPES.PatientAuthController);
const doctorController=container.get<DoctorController>(TYPES.DoctorController)

// Patient Auth
router.post("/register", async (req: Request, res: Response) => {
  await patientController.signup(req, res);
});
router.post("/login", async (req: Request, res: Response) => {
  await patientController.login(req, res);
});
router.post("/otp_verification", async (req: Request, res: Response) => {
  await patientController.verifyOtp(req, res);
});
router.post("/resend_otp", async (req: Request, res: Response) => {
  await patientController.resendOtp(req, res);
});
router.get("/refresh-token", async (req: Request, res: Response) => {
  await patientController.refreshToken(req, res);
});
router.post("/google_auth",async (req:Request,res:Response)=>{
  await patientController.googleAuth(req,res)
})


//Pages

router.get("/doctors",async (req:Request,res:Response)=>{
  await doctorController.getApprovedDoctors(req,res)
})

export default router;
