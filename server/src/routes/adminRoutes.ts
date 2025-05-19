import { Router } from "express";
import { container } from "../di/container";
import TYPES from "../di/types";
import { Request, Response } from "express";
import { AdminController } from "../controller/adminController";
import upload from "../middleware/multer";
import DocRegController from "../controller/adminDoctorController";
import authenticateAdmin from "../middleware/adminAuthMiddleware"; // Import middleware
import { AppointmentController } from "../controller/appointmentController";
import { DashboardController } from "../controller/dashboardController";

let router = Router();



const adminController = container.get<AdminController>(TYPES.adminController);
const adminDoctorController = container.get<DocRegController>(TYPES.DocRegController);
const appointmentController=container.get<AppointmentController>(TYPES.AppointmentController)
const admindashboardController=container.get<DashboardController>(TYPES.AdmindashboardController)


router.post("/admin_login", async (req: Request, res: Response) => {
  await adminController.adminLogin(req, res);
});

router.get("/refresh_token", async (req: Request, res: Response) => {
  await adminController.refreshToken(req, res);
});


router.post(
  "/add_doctor",
  authenticateAdmin, 
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "kycCertificate", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    await adminDoctorController.registerDoctor(req, res);
  }
);

router.get("/all_doctors", authenticateAdmin, async (req: Request, res: Response) => {
  await adminDoctorController.getAllDoctors(req, res);
});

router.put("/doctor/:id", authenticateAdmin, async (req: Request, res: Response) => {
  await adminDoctorController.updateDoctor(req, res);
});

router.patch("/doctor/toggle_approval/:id", authenticateAdmin, async (req: Request, res: Response) => {
  await adminDoctorController.toggleDoctorApproval(req, res);
});

router.get("/patients", authenticateAdmin, async (req: Request, res: Response) => {
  await adminDoctorController.getAllPatients(req, res);
});

router.put('/toggle_status/:id',async (req:Request,res:Response)=>{
  await adminController.togglePatientBlockStatus(req,res)
})

router.get("/appointments",authenticateAdmin,async (req:Request,res:Response)=>{
  await appointmentController.getAllAppointments(req,res)
})

router.get("/dashboard",authenticateAdmin,async (req:Request,res:Response)=>{
  await admindashboardController.getDashboard(req,res)
})

router.get('/profitData',authenticateAdmin,async (req:Request,res:Response)=>{
  await admindashboardController.getProfitDataForAdmin(req,res)
})

router.post('/logout',async (req:Request,res:Response)=>{
  adminController.logOut(req,res)
})

export default router;
