 const TYPES = {
  AdminRepository: Symbol.for("AdminRepository"),
  BaseRepository: Symbol.for("BaseRepository"),
  PatientRepository: Symbol.for("PatientRepository"),
  DoctorRegRepository: Symbol.for("DoctorRegRepository"),
  DoctorRepository:Symbol.for("DoctorRepository"),
  SlotRepository:Symbol.for("SlotRepository"),
  AppointmentRepository:Symbol.for("AppointmentRepository"),



  DoctorRegService: Symbol.for("DoctorRegService"),
  PatientService: Symbol.for("PatientService"),
  AdminService: Symbol.for("AdminService"),
  DoctorService:Symbol.for("DoctorService"),
  SlotService:Symbol.for("SlotService"),
  AppointmentService:Symbol.for("AppointmentService"),
  AdminDashboardService:Symbol.for("AdminDashboardService"),
  DoctorDashboardService:Symbol.for("DoctorDashboardService"),

  PatientAuthController: Symbol.for("PatientAuthController"),
  DocRegController: Symbol.for("DocRegController"),
  adminController:Symbol.for("adminController"),
  DoctorController:Symbol.for("DoctorController"),
  SlotController:Symbol.for("SlotController"),
  AppointmentController:Symbol.for("AppointmentController"),
  AdmindashboardController:Symbol.for("AdmindashboardController"),

  PatientModel: Symbol.for("PatientModel"),
  DoctorModel:Symbol.for("DoctorModel"),
  AdminModel:Symbol.for("AdminModel"),
  SlotModel:Symbol.for("SlotModel"),
  AppointmentModel:Symbol.for("AppointmentModel"),
  PrescriptionModel:Symbol.for("Prescription"),
  ReviewModel:Symbol.for("ReviewModel")
};

export default TYPES
