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
const types_1 = __importDefault(require("../di/types"));
const container_1 = require("../di/container");
const multer_1 = __importDefault(require("../middleware/multer"));
const doctorAuthMiddleware_1 = __importDefault(require("../middleware/doctorAuthMiddleware"));
const router = (0, express_1.Router)();
const doctorController = container_1.container.get(types_1.default.DoctorController);
const appointmentController = container_1.container.get(types_1.default.AppointmentController);
const slotController = container_1.container.get(types_1.default.SlotController);
const doctordDashboardController = container_1.container.get(types_1.default.AdmindashboardController);
const patientController = container_1.container.get(types_1.default.PatientAuthController);
const chatController = container_1.container.get(types_1.default.ChatController);
//Doctor Auth
router.post("/send_otp", (req, res) => {
    doctorController.sendOtp(req, res);
});
router.post("/verify_otp", (req, res) => {
    doctorController.verifyOtp(req, res);
});
router.post("/resend_otp", (req, res) => {
    doctorController.resendOtp(req, res);
});
router.post('/google-auth', (req, res) => {
    doctorController.googleAuth(req, res);
});
router.get("/refresh_token", (req, res) => {
    doctorController.refreshToken(req, res);
});
//Pages
router.get("/fetch_doctor/:doctorId", doctorAuthMiddleware_1.default, (req, res) => {
    doctorController.getDoctor(req, res);
});
router.put("/profile/:doctorId", doctorAuthMiddleware_1.default, multer_1.default.single("profileImg"), (req, res) => {
    doctorController.updateDoctor(req, res);
});
router.get("/my_appointment", doctorAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    appointmentController.getDoctorAppointment(req, res);
}));
router.patch("/update_status/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    appointmentController.changeAppointmentStatus(req, res);
}));
// Slots
router.get("/get_slots/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    slotController.getAllSlotsOfDoctor(req, res);
}));
router.post("/create_slot/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    slotController.createSlot(req, res);
}));
router.post('/recurring_slot', doctorAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    slotController.createRecurringSlots(req, res);
}));
router.patch('/slot_edit/:id', doctorAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield slotController.editSlot(req, res);
}));
router.patch('/slot_cancel/:id', doctorAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield slotController.cancelSlot(req, res);
}));
//Prescription
router.post("/prescription/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    appointmentController.createPrescription(req, res);
}));
router.get("/prescription/:appointmentId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    appointmentController.getPrescription(req, res);
}));
//  Dashboard
router.get("/dashboard/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    doctordDashboardController.getDoctorDashboard(req, res);
}));
//Reviews
router.get("/reviews/:doctorId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    patientController.getReviewByDoctorId(req, res);
}));
//Chat
router.post('/send_message', doctorAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    chatController.sendMessage(req, res);
}));
router.get('/get_patients', doctorAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    appointmentController.getPatientsByDoctors(req, res);
}));
router.get('/get_conversation/:user1Id', doctorAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    chatController.getConversation(req, res);
}));
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    patientController.logOut(req, res);
}));
router.get('/get_unread_message_count/:id', doctorAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    chatController.getUnreadMessageCount(req, res);
}));
router.put('/mark_read/:id', doctorAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    chatController.markMessageAsRead(req, res);
}));
exports.default = router;
