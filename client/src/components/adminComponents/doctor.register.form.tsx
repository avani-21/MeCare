"use client";
import { useState } from "react";
import { registerDoctor } from "@/lib/api/admin/doctorRegister";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function DoctorRegistration() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [kycCertificate, setKycCertificate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Validation Schema
  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    experience: Yup.number()
      .min(0, "Experience cannot be negative")
      .required("Experience is required"),
    consultantFee: Yup.number()
      .min(0, "Fee cannot be negative")
      .required("Consultation fee is required"),
    specialization: Yup.string().required("Specialization is required"),
    education: Yup.string().required("Education is required"),
    gender: Yup.string().required("Gender is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    street: Yup.string().required("Street address is required"),
    pincode: Yup.string()
      .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
      .required("Pincode is required"),
    about: Yup.string().required("About section is required"),
    availableDays: Yup.array()
      .min(1, "Select at least one available day")
      .required("Available days are required"),
    profileImg: Yup.mixed().required("Profile image is required"),
    kycCertificate: Yup.mixed().required("KYC certificate is required"),
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      experience: "",
      consultantFee: "",
      specialization: "General physician",
      education: "",
      gender: "",
      phone: "",
      city: "",
      state: "",
      street: "",
      pincode: "",
      about: "",
      availableDays: [] as string[],
      profileImg: null as File | null,
      kycCertificate: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const data = new FormData();
        
        // Append all form values to FormData
        Object.entries(values).forEach(([key, value]) => {
          if (value === null || value === undefined) return;
          
          if (Array.isArray(value)) {
            value.forEach(v => data.append(key, v));
          } else if (value instanceof File) {
            data.append(key, value);
          } else {
            data.append(key, value.toString());
          }
        });

        const response: any = await registerDoctor(data);
        
        if (response && response.status === 201) {
          toast.success("New doctor added successfully");
          formik.resetForm();
          setProfileImage(null);
          setKycCertificate(null);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Error adding new doctor");
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle file uploads with preview
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "profileImg" | "kycCertificate"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      formik.setFieldValue(field, file);

      if (field === "profileImg") {
        setProfileImage(imageUrl);
      } else if (field === "kycCertificate") {
        setKycCertificate(imageUrl);
      }
    }
  };

  // Handle available days selection
  const toggleDay = (day: string) => {
    const currentDays = [...formik.values.availableDays];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    
    formik.setFieldValue("availableDays", updatedDays);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded-md shadow-md">
      <div className="grid grid-cols-2 gap-4">
        {/* Profile & KYC Upload */}
        <div className="flex flex-col items-center">
          <label className="text-sm font-medium">Change Profile</label>
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mt-2">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
          <input 
            type="file" 
            onChange={(e) => handleFileChange(e, "profileImg")} 
            className="mt-2 text-sm" 
          />
          {formik.touched.profileImg && formik.errors.profileImg && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.profileImg}</div>
          )}
        </div>
        
        <div className="flex flex-col items-center">
          <label className="text-sm font-medium">Add KYC Certificate</label>
          <div className="w-24 h-24 bg-gray-200 mt-2 flex items-center justify-center">
            {kycCertificate ? (
              <img src={kycCertificate} alt="KYC Certificate" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-500">No Image</div>
            )}
          </div>
          <input 
            type="file" 
            onChange={(e) => handleFileChange(e, "kycCertificate")} 
            className="mt-2 text-sm" 
          />
          {formik.touched.kycCertificate && formik.errors.kycCertificate && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.kycCertificate}</div>
          )}
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium">Doctor Name</label>
          <input 
            type="text" 
            name="fullName" 
            value={formik.values.fullName} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border rounded-md" 
          />
          {formik.touched.fullName && formik.errors.fullName && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.fullName}</div>
          )}
        </div>

        {/* Speciality */}
        <div>
          <label className="block text-sm font-medium">Speciality</label>
          <select 
            name="specialization" 
            value={formik.values.specialization} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border rounded-md"
          >
            <option>General physician</option>
            <option>Gynacologist</option>
            <option>Pediatrition</option>
            <option>Neurologist</option>
          </select>
          {formik.touched.specialization && formik.errors.specialization && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.specialization}</div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Doctor Email</label>
          <input 
            type="email" 
            name="email" 
            value={formik.values.email} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border rounded-md" 
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
          )}
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-medium">Education</label>
          <input 
            type="text" 
            name="education" 
            value={formik.values.education} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border rounded-md" 
          />
          {formik.touched.education && formik.errors.education && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.education}</div>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium">Doctor Password</label>
          <input 
            type="password" 
            name="password" 
            value={formik.values.password} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border rounded-md" 
          />
          {formik.touched.password && formik.errors.password && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium">Gender</label>
          <select 
            name="gender" 
            value={formik.values.gender} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          {formik.touched.gender && formik.errors.gender && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.gender}</div>
          )}
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium">Experience</label>
          <input 
            type="number" 
            name="experience" 
            value={formik.values.experience} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border rounded-md" 
          />
          {formik.touched.experience && formik.errors.experience && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.experience}</div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input 
            type="text" 
            name="phone" 
            value={formik.values.phone} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border rounded-md" 
          />
          {formik.touched.phone && formik.errors.phone && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.phone}</div>
          )}
        </div>

        {/* Consultation Fees */}
        <div>
          <label className="block text-sm font-medium">Consultation Fees</label>
          <input 
            type="number" 
            name="consultantFee" 
            value={formik.values.consultantFee} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border rounded-md" 
          />
          {formik.touched.consultantFee && formik.errors.consultantFee && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.consultantFee}</div>
          )}
        </div>

        {/* Address Fields */}
        <div>
          <label className="block text-sm font-medium">Address</label>
          <input 
            type="text" 
            name="street" 
            value={formik.values.street} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Street" 
            className="w-full p-2 border rounded-md" 
          />
          {formik.touched.street && formik.errors.street && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.street}</div>
          )}
          
          <input 
            type="text" 
            name="city" 
            value={formik.values.city} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="City" 
            className="w-full p-2 border rounded-md mt-2" 
          />
          {formik.touched.city && formik.errors.city && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.city}</div>
          )}
          
          <input 
            type="text" 
            name="state" 
            value={formik.values.state} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="State" 
            className="w-full p-2 border rounded-md mt-2" 
          />
          {formik.touched.state && formik.errors.state && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.state}</div>
          )}
          
          <input 
            type="text" 
            name="pincode" 
            value={formik.values.pincode} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Pincode" 
            className="w-full p-2 border rounded-md mt-2" 
          />
          {formik.touched.pincode && formik.errors.pincode && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.pincode}</div>
          )}
        </div>
      </div>

      {/* Available Days Selection */}
      <div className="mt-4">
        <label className="block text-sm font-medium">Available Days</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              type="button"
              className={`px-3 py-1 border rounded-md ${
                formik.values.availableDays.includes(day) 
                  ? "bg-teal-600 text-white" 
                  : "hover:bg-gray-100"
              }`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
        {formik.touched.availableDays && formik.errors.availableDays && (
          <div className="text-red-500 text-xs mt-1">{formik.errors.availableDays}</div>
        )}
      </div>

      {/* About Me */}
      <div className="mt-4">
        <label className="block text-sm font-medium">About Me</label>
        <textarea 
          name="about" 
          value={formik.values.about} 
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full p-2 border rounded-md h-20"
        ></textarea>
        {formik.touched.about && formik.errors.about && (
          <div className="text-red-500 text-xs mt-1">{formik.errors.about}</div>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-6 text-center">
        <button 
          type="submit" 
          className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700"
          disabled={loading}
        >
          {loading ? "Adding doctor..." : "Save"}
        </button>
      </div>
    </form>
  );
}