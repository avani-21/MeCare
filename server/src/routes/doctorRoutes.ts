import { response, Router } from "express";
import TYPES from "../di/types";
import { container } from "../di/container"
import { Request,Response } from "express";
import DoctorController from "../controller/doctorController";
import upload from "../middleware/multer";
import authenticateDoctor from "../middleware/doctorAuthMiddleware";
import { AppointmentController } from "../controller/appointmentController";
import { SlotController } from "../controller/slotController";
import { AdminDashboardService } from "../services/adminDashboardService";
import { DashboardController } from "../controller/dashboardController";
import PatientAuthController from "../controller/patientController";

const router=Router();

const doctorController=container.get<DoctorController>(TYPES.DoctorController);
const appointmentController=container.get<AppointmentController>(TYPES.AppointmentController)
const slotController=container.get<SlotController>(TYPES.SlotController)
const doctordDashboardController=container.get<DashboardController>(TYPES.AdmindashboardController)
const patientController=container.get<PatientAuthController>(TYPES.PatientAuthController)

router.post("/send_otp",(req:Request,res:Response)=>{
    doctorController.sendOtp(req,res)
})

router.post("/verify_otp",(req:Request,res:Response)=>{
    doctorController.verifyOtp(req,res)
})

router.post("/resend_otp",(req:Request,res:Response)=>{
    doctorController.resendOtp(req,res)
})

router.put("/profile/:doctorId",authenticateDoctor,upload.single("profileImg"),(req,res)=>{
    doctorController.updateDoctor(req,res)
})


router.post('/google-auth', (req:Request, res:Response) =>{
   doctorController.googleAuth(req,res)
})

router.get("/fetch_doctor/:doctorId",authenticateDoctor,(req:Request,res:Response)=>{
    doctorController.getDoctor(req,res)
})

router.get("/refresh_token",(req:Request,res:Response)=>{
    doctorController.refreshToken(req,res)
})

router.get("/my_appointment/:id",authenticateDoctor,async (req:Request,res:Response)=>{
   appointmentController.getDoctorAppointment(req,res)
})

router.patch("/update_status/:id",async (req:Request,res:Response)=>{
    appointmentController.changeAppointmentStatus(req,res)
})

router.get("/get_slots/:id",async (req:Request,res:Response)=>{
    slotController.getAllSlotsOfDoctor(req,res)
})

router.post("/create_slot/:id",async (req:Request,res:Response)=>{
    slotController.createSlot(req,res)
})

router.post("/prescription/:id",async (req:Request,res:Response)=>{
    appointmentController.createPrescription(req,res)
})

router.get("/prescription/:appointmentId",async (req:Request,res:Response)=>{
    appointmentController.getPrescription(req,res)
})

router.get("/dashboard/:id",async (req:Request,res:Response)=>{
   doctordDashboardController.getDoctorDashboard(req,res)  
})

router.get("/reviews/:doctorId", async (req:Request,res:Response)=>{
     patientController.getReviewByDoctorId(req,res)
})

export default router