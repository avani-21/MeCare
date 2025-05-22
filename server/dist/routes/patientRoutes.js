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
const patientAuthMiddleware_1 = __importDefault(require("../middleware/patientAuthMiddleware"));
const multer_1 = __importDefault(require("../middleware/multer"));
const router = (0, express_1.Router)();
const patientController = container_1.container.get(types_1.default.PatientAuthController);
const doctorController = container_1.container.get(types_1.default.DoctorController);
const slotController = container_1.container.get(types_1.default.SlotController);
const appointmentController = container_1.container.get(types_1.default.AppointmentController);
const chatController = container_1.container.get(types_1.default.ChatController);
// Patient Auth
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield patientController.signup(req, res);
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield patientController.login(req, res);
}));
router.post("/otp_verification", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield patientController.verifyOtp(req, res);
}));
router.post("/resend_otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield patientController.resendOtp(req, res);
}));
router.get("/refresh-token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield patientController.refreshToken(req, res);
}));
router.post("/google_auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield patientController.googleAuth(req, res);
}));
router.post("/send_otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield patientController.sendOtp(req, res);
}));
router.post("/reset_password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield patientController.resetPassword(req, res);
}));
//Pages
router.get("/doctors", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield doctorController.getApprovedDoctors(req, res);
}));
router.get("/doctors/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield doctorController.getSingleDoctor(req, res);
}));
router.get("/patient_profile", patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield patientController.getPatientProfile(req, res);
}));
router.get("/doctors/slot/:id", patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield slotController.findSlotBydoctor(req, res);
}));
// profile
router.patch("/profile", patientAuthMiddleware_1.default, multer_1.default.single("profileImage"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield patientController.updateProfile(req, res);
}));
router.patch("/change_password", patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield patientController.changePassword(req, res);
}));
//Appointment
router.post("/doctor/appointment", patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield appointmentController.bookAppointment(req, res);
}));
router.get("/doctor/appointment_booking/:id", patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield appointmentController.getSingleAppointment(req, res);
}));
router.post("/create_payment", patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield appointmentController.checkOutSession(req, res);
}));
router.patch("/change_payment_status", patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield appointmentController.markAppointmentpaid(req, res);
}));
router.get("/get_appointment", patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield appointmentController.getPatientAppointment(req, res);
}));
router.get("/prescription/:appointmentId", patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    appointmentController.getPrescription(req, res);
}));
//review
router.post('/review/:doctorId', patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    patientController.createReview(req, res);
}));
router.get('/review/:appointmentId', patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    patientController.getReview(req, res);
}));
router.put('/reviews/:reviewId', patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    patientController.updateReview(req, res);
}));
// chat
router.post('/send_message', patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    chatController.sendMessage(req, res);
}));
router.get('/get_doctors', patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    appointmentController.getDoctorByPatient(req, res);
}));
router.get('/get_conversation/:user1Id', patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    chatController.getConversation(req, res);
}));
router.get('/get_unread_message_count/:id', patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    chatController.getUnreadMessageCount(req, res);
}));
router.put('/mark_read/:id', patientAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    chatController.markMessageAsRead(req, res);
}));
//Logout
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    patientController.logOut(req, res);
}));
exports.default = router;
