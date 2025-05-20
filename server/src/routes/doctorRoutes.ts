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
import { ChatController } from "../controller/chatController";

const router=Router();

const doctorController=container.get<DoctorController>(TYPES.DoctorController);
const appointmentController=container.get<AppointmentController>(TYPES.AppointmentController)
const slotController=container.get<SlotController>(TYPES.SlotController)
const doctordDashboardController=container.get<DashboardController>(TYPES.AdmindashboardController)
const patientController=container.get<PatientAuthController>(TYPES.PatientAuthController)
const chatController=container.get<ChatController>(TYPES.ChatController)

//Doctor Auth

router.post("/send_otp",(req:Request,res:Response)=>{
    doctorController.sendOtp(req,res)
})

router.post("/verify_otp",(req:Request,res:Response)=>{
    doctorController.verifyOtp(req,res)
})

router.post("/resend_otp",(req:Request,res:Response)=>{
    doctorController.resendOtp(req,res)
})

router.post('/google-auth', (req:Request, res:Response) =>{
   doctorController.googleAuth(req,res)
})

router.get("/refresh_token",(req:Request,res:Response)=>{
    doctorController.refreshToken(req,res)
})


//Pages

router.get("/fetch_doctor/:doctorId",authenticateDoctor,(req:Request,res:Response)=>{
    doctorController.getDoctor(req,res)
})


router.put("/profile/:doctorId",authenticateDoctor,upload.single("profileImg"),(req,res)=>{
    doctorController.updateDoctor(req,res)
})

router.get("/my_appointment",authenticateDoctor,async (req:Request,res:Response)=>{
   appointmentController.getDoctorAppointment(req,res)
})

router.patch("/update_status/:id",async (req:Request,res:Response)=>{
    appointmentController.changeAppointmentStatus(req,res)
})

// Slots

router.get("/get_slots/:id",async (req:Request,res:Response)=>{
    slotController.getAllSlotsOfDoctor(req,res)
})

router.post("/create_slot/:id",async (req:Request,res:Response)=>{
    slotController.createSlot(req,res)
})

router.post('/recurring_slot',authenticateDoctor,async (req:Request,res:Response)=>{
    slotController.createRecurringSlots(req,res)
})

router.patch('/slot_edit/:id',authenticateDoctor,async (req:Request,res:Response)=>{
    await slotController.editSlot(req,res)
})

router.patch('/slot_cancel/:id',authenticateDoctor,async (req:Request,res:Response)=>{
    await slotController.cancelSlot(req,res)
})

//Prescription

router.post("/prescription/:id",async (req:Request,res:Response)=>{
    appointmentController.createPrescription(req,res)
})

router.get("/prescription/:appointmentId",async (req:Request,res:Response)=>{
    appointmentController.getPrescription(req,res)
})


//  Dashboard

router.get("/dashboard/:id",async (req:Request,res:Response)=>{
   doctordDashboardController.getDoctorDashboard(req,res)  
})

//Reviews

router.get("/reviews/:doctorId", async (req:Request,res:Response)=>{
     patientController.getReviewByDoctorId(req,res)
})

//Chat

router.post('/send_message',authenticateDoctor,async (req:Request,res:Response)=>{
    chatController.sendMessage(req,res)
})

router.get('/get_patients',authenticateDoctor, async (req:Request,res:Response)=>{
   appointmentController.getPatientsByDoctors(req,res)
})

router.get('/get_conversation/:user1Id',authenticateDoctor,async (req:Request,res:Response)=>{
  chatController.getConversation(req,res)
})

router.post('/logout',async (req:Request,res:Response)=>{
  patientController.logOut(req,res)
})



router.get('/get_unread_message_count/:id',authenticateDoctor,async (req:Request,res:Response)=>{
  chatController.getUnreadMessageCount(req,res)
})

router.put('/mark_read/:id',authenticateDoctor,async (req:Request,res:Response)=>{
  chatController.markMessageAsRead(req,res)
})

export default router