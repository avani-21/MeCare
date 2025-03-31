

 const TYPES = {
  AdminRepository: Symbol.for("AdminRepository"),
  BaseRepository: Symbol.for("BaseRepository"),
  PatientRepository: Symbol.for("PatientRepository"),
  DoctorRegRepository: Symbol.for("DoctorRegRepository"),
  DoctorRepository:Symbol.for("DoctorRepository"),



  DoctorRegService: Symbol.for("DoctorRegService"),
  PatientService: Symbol.for("PatientService"),
  AdminService: Symbol.for("AdminService"),
  DoctorService:Symbol.for("DoctorService"),

  PatientAuthController: Symbol.for("PatientAuthController"),
  DocRegController: Symbol.for("DocRegController"),
  adminController:Symbol.for("adminController"),
  DoctorController:Symbol.for("DoctorController"),

  PatientModel: Symbol.for("PatientModel"),
  DoctorModel:Symbol.for("DoctorModel"),
  AdminModel:Symbol.for("AdminModel")
};

export default TYPES
