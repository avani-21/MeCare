"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = require("../di/container");
const types_1 = __importDefault(require("../di/types"));
const multer_1 = __importDefault(require("../middleware/multer"));
const adminAuthMiddleware_1 = __importDefault(require("../middleware/adminAuthMiddleware")); // Import middleware
let router = (0, express_1.Router)();
const adminController = container_1.container.get(types_1.default.adminController);
const adminDoctorController = container_1.container.get(types_1.default.DocRegController);
const appointmentController = container_1.container.get(types_1.default.AppointmentController);
const admindashboardController = container_1.container.get(types_1.default.AdmindashboardController);
router.post("/admin_login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield adminController.adminLogin(req, res);
}));
router.get("/refresh_token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield adminController.refreshToken(req, res);
}));
router.post("/add_doctor", adminAuthMiddleware_1.default, multer_1.default.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "kycCertificate", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield adminDoctorController.registerDoctor(req, res);
}));
router.get("/all_doctors", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield adminDoctorController.getAllDoctors(req, res);
}));
router.put("/doctor/:id", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield adminDoctorController.updateDoctor(req, res);
}));
router.patch("/doctor/toggle_approval/:id", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield adminDoctorController.toggleDoctorApproval(req, res);
}));
router.get("/patients", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield adminDoctorController.getAllPatients(req, res);
}));
router.put('/toggle_status/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield adminController.togglePatientBlockStatus(req, res);
}));
router.get("/appointments", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield appointmentController.getAllAppointments(req, res);
}));
router.get("/dashboard", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield admindashboardController.getDashboard(req, res);
}));
router.get('/profitData', adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield admindashboardController.getProfitDataForAdmin(req, res);
}));
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    adminController.logOut(req, res);
}));
exports.default = router;
