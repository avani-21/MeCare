"use client";
import { useState } from "react";
import { registerDoctor } from "@/lib/api/admin/doctorRegister";
import {toast} from "sonner"

export default function DoctorRegistration() {
  const [formData, setFormData] = useState({
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
  });

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [kycCertificate, setKycCertificate] = useState<string | null>(null);
  const [loading,setLoading]=useState(false)


  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file uploads
// Handle file uploads with preview
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "profileImg" | "kycCertificate") => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);

    setFormData({ ...formData, [field]: file });

    if (field === "profileImg") {
      setProfileImage(imageUrl);
    } else if (field === "kycCertificate") {
      setKycCertificate(imageUrl);
    }
  }
};


  // Handle available days selection
  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  //Submit functioanlity

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(false)
  
    const data = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (value === null || value === undefined) continue;
  
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== null && v !== undefined) {
            data.append(key, v.toString());
          }
        });
      } else {
        data.append(key, value instanceof File ? value : value.toString());
      }
    }
  
    try {
      setLoading(true)
      const response: any = await registerDoctor(data);
      console.log("API Response:", response);
  
      if (response && response.status === 201) { // Ensure successful response
        toast.success("New doctor added successfully");
  
        // Reset form after successful submission
        setFormData({
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
          availableDays: [],
          profileImg: null,
          kycCertificate: null,
        });
  
        // Reset file preview states
        setProfileImage(null);
        setKycCertificate(null);
      }
    } catch (error: any) {
      console.error("API Error:", error);
      setLoading(false)
      toast.error(error?.response?.data?.message || "Error adding new doctor");
    }finally{
      setLoading(true)
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded-md shadow-md">
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
        <input type="file" onChange={(e) => handleFileChange(e, "profileImg")} className="mt-2 text-sm" />
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
        <input type="file" onChange={(e) => handleFileChange(e, "kycCertificate")} className="mt-2 text-sm" />
      </div>
    </div>
  
    {/* Input Fields */}
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div>
        <label className="block text-sm font-medium">Doctor Name</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium">Speciality</label>
        <select name="specialization" value={formData.specialization} onChange={handleChange} className="w-full p-2 border rounded-md">
          <option>General physician</option>
          <option>Cardiologist</option>
          <option>Dentist</option>
          <option>Dermatologist</option>
        </select>
      </div>
  
      <div>
        <label className="block text-sm font-medium">Doctor Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium">Education</label>
        <input type="text" name="education" value={formData.education} onChange={handleChange} className="w-full p-2 border rounded-md" />
      </div>
  
      <div>
        <label className="block text-sm font-medium">Doctor Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium">Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded-md">
          <option value="">Select</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>
  
      <div>
        <label className="block text-sm font-medium">Experience</label>
        <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="w-full p-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded-md" />
      </div>
  
      <div>
        <label className="block text-sm font-medium">Consultation Fees</label>
        <input type="number" name="consultantFee" value={formData.consultantFee} onChange={handleChange} className="w-full p-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium">Address</label>
        <input type="text" name="street" value={formData.street} onChange={handleChange} placeholder="Street" className="w-full p-2 border rounded-md" />
        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full p-2 border rounded-md mt-2" />
        <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full p-2 border rounded-md mt-2" />
        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" className="w-full p-2 border rounded-md mt-2" />
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
            className={`px-3 py-1 border rounded-md ${formData.availableDays.includes(day) ? "bg-teal-600 text-white" : "hover:bg-gray-100"}`}
            onClick={() => toggleDay(day)}
          >
            {day}
          </button>
        ))}
      </div>
    </div>

  
    {/* About Me */}
    <div className="mt-4">
      <label className="block text-sm font-medium">About Me</label>
      <textarea name="about" value={formData.about} onChange={handleChange} className="w-full p-2 border rounded-md h-20"></textarea>
    </div>
  
    {/* Submit Button */}
    <div className="mt-6 text-center">
      <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700">
        {loading ? "Addind doctor" : "Save"}
      </button>
    </div>
  </form>
  
  );
}
