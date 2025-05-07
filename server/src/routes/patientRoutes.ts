
import {  Router } from "express";
import TYPES from "../di/types";
import { container } from "../di/container";
import { Request, Response } from "express";
import PatientAuthController from "../controller/patientController";
import DoctorController from "../controller/doctorController";
import authenticatePatient from "../middleware/patientAuthMiddleware";
import { SlotController } from "../controller/slotController";
import { AppointmentController } from "../controller/appointmentController";
import upload from "../middleware/multer";

const router = Router();


const patientController = container.get<PatientAuthController>(TYPES.PatientAuthController);
const doctorController=container.get<DoctorController>(TYPES.DoctorController)
const slotController=container.get<SlotController>(TYPES.SlotController);
const appointmentController=container.get<AppointmentController>(TYPES.AppointmentController)

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

router.post("/send_otp",async (req:Request,res:Response)=>{
  await patientController.sendOtp(req,res)
})

router.post("/reset_password",async (req:Request,res:Response)=>{
  await patientController.resetPassword(req,res)
})


//Pages

router.get("/doctors",async (req:Request,res:Response)=>{
  await doctorController.getApprovedDoctors(req,res)
})

router.get("/doctors/:id",async(req:Request,res:Response)=>{
  await doctorController.getSingleDoctor(req,res)
})

router.get("/patient_profile",authenticatePatient,async (req:Request,res:Response)=>{
await patientController.getPatientProfile(req,res)
})

router.get("/doctors/slot/:id",authenticatePatient,async(req:Request,res:Response)=>{
 await slotController.findSlotBydoctor(req,res)
})



router.patch("/profile",authenticatePatient,upload.single("profileImage"),async (req:Request,res:Response)=>{
  await patientController.updateProfile(req,res)
})
router.patch("/change_password",authenticatePatient,async (req:Request,res:Response)=>{
  await patientController.changePassword(req,res)
})

router.post("/doctor/appointment",authenticatePatient,async (req:Request,res:Response)=>{
  await appointmentController.bookAppointment(req,res)
})
 
router.get("/doctor/appointment_booking/:id",async (req:Request,res:Response)=>{
  await appointmentController.getSingleAppointment(req,res)
})


router.post("/create_payment",authenticatePatient,async (req:Request,res:Response)=>{
  await appointmentController.checkOutSession(req,res)
})

router.patch("/change_payment_status",authenticatePatient,async (req:Request,res:Response)=>{
  await appointmentController.markAppointmentpaid(req,res)
})

router.get("/get_appointment",authenticatePatient,async (req:Request,res:Response)=>{
  await appointmentController.getPatientAppointment(req,res)
})

router.get("/prescription/:appointmentId",async (req:Request,res:Response)=>{
    appointmentController.getPrescription(req,res)
})

router.post('/review/:doctorId', async (req:Request,res:Response)=>{
   patientController.createReview(req,res)
})

router.get('/review/:appointmentId',async (req:Request,res:Response)=>{
  patientController.getReview(req,res)
})


export default router;
