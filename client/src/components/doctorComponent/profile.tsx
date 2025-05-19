"use client";
import { getDoctor } from "@/lib/api/doctor/doctor";
import { useEffect, useState } from "react";
import { updateDoctor } from "@/lib/api/doctor/doctor";
import { toast } from "sonner";

interface IDoctor{
  _id: string;
  fullName: string;
  specialization: string;
  education: string;
  gender: string;
  experience: number;
  consultantFee: number;
  profileImg: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  about: string;
  kycCertificate: string;
  availableDays: string[];
  email: string;
  password: string;
  isVerified: boolean;
  isApproved: boolean;
  reviewCount: number;
  createdAt: Date;
  rating: number;
  otp?: string;
  otpExpiration?: string;
}


const DoctorProfile = () => {
  const [doctorId, setDoctorId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [doctorData, setDoctorData] = useState<Partial<IDoctor>>({
    fullName: "",
    specialization: "",
    education: "",
    phone: "",
    experience: 0,
    consultantFee: 0,
    gender: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    about: "",
  });
  const [profileImg, setProfileImg] = useState<File | string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImg(e.target.files[0]);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setDoctorData((prev) => ({
      ...prev,
      [name]: name === "experience" || name === "consultantFee" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("doctorId", doctorId);
      formData.append("fullName", doctorData.fullName || "");
      formData.append("specialization", doctorData.specialization || "");
      formData.append("education", doctorData.education || "");
      formData.append("phone", doctorData.phone || "");
      formData.append("experience", String(doctorData.experience || 0));
      formData.append("consultantFee", String(doctorData.consultantFee || 0));
      formData.append("gender", doctorData.gender || "");
      formData.append("street", doctorData.street || "");
      formData.append("city", doctorData.city || "");
      formData.append("state", doctorData.state || "");
      formData.append("pincode", doctorData.pincode || "");
      formData.append("about", doctorData.about || "");

      if (profileImg && typeof profileImg !== "string") {
        formData.append("profileImg", profileImg);
      }

      await updateDoctor(doctorId, formData);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      setLoading(false);
      console.error("Error updating profile:", error.message);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      let result = await getDoctor();
      setDoctorId(result._id || "");
      setDoctorData({
        fullName: result.fullName || "",
        specialization: result.specialization || "",
        education: result.education || "",
        phone: result.phone || "",
        experience: result.experience || 0,
        consultantFee: result.consultantFee || 0,
        gender: result.gender || "",
        street: result.street || "",
        city: result.city || "",
        state: result.state || "",
        pincode: result.pincode || "",
        about: result.about || "",
      });

      setProfileImg(result.profileImg || null);
    } catch (error: any) {
      console.error("Error fetching doctor data:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          {profileImg ? (
            typeof profileImg === "string" ? (
              <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <img src={URL.createObjectURL(profileImg)} alt="Profile" className="w-full h-full object-cover" />
            )
          ) : (
            <span className="text-gray-500">No Image</span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="p-2 border rounded-md"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Doctor Name</label>
          <input
            type="text"
            name="fullName"
            value={doctorData.fullName || "Gen"}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Speciality</label>
          <select
            name="specialization"
            value={doctorData.specialization || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select Speciality</option>
            <option value="General physician">General physician</option>
            <option value="Gynacologist">Gynacologist</option>
            <option value="Pediatrition">Pediatrition</option>
            <option value="Neurologist">Neurologist</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Education</label>
          <input
            type="text"
            name="education"
            value={doctorData.education || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="tel"
            name="phone"
            value={doctorData.phone || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Experience (Years)</label>
          <input
            type="number"
            name="experience"
            value={doctorData.experience || 0}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Consultation Fees</label>
          <input
            type="number"
            name="consultantFee"
            value={doctorData.consultantFee || 0}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Gender</label>
          <select
            name="gender"
            value={doctorData.gender || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Street</label>
          <input
            type="text"
            name="street"
            value={doctorData.street || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              type="text"
              name="city"
              value={doctorData.city || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">State</label>
            <input
              type="text"
              name="state"
              value={doctorData.state || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Pincode</label>
          <input
            type="text"
            name="pincode"
            value={doctorData.pincode || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">About Me</label>
          <textarea
            name="about"
            value={doctorData.about || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            rows={3}
            required
          ></textarea>
        </div>

        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md w-full">
          {loading ? "Saving changes .....":"Save changes"}
        </button>
      </form>
    </div>
  );
};

export default DoctorProfile;