import { Router } from "express";
import TYPES from "../di/types";
import { container } from "../di/container"
import { Request,Response } from "express";
import DoctorController from "../controller/doctorController";
import upload from "../middleware/multer";
import authenticateDoctor from "../middleware/doctorAuthMiddleware";

const router=Router();

const doctorController=container.get<DoctorController>(TYPES.DoctorController);

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


export default router