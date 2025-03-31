import { Router } from "express";
import { container } from "../di/container";
import TYPES from "../di/types";
import { Request, Response } from "express";
import { AdminController } from "../controller/adminController";
import upload from "../middleware/multer";
import DocRegController from "../controller/adminDoctorController";
import authenticateAdmin from "../middleware/adminAuthMiddleware"; // Import middleware

let router = Router();



const adminController = container.get<AdminController>(TYPES.adminController);
const adminDoctorController = container.get<DocRegController>(TYPES.DocRegController);


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

export default router;
