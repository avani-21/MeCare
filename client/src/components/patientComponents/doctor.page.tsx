"use client";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { Search } from "lucide-react";
import { getDoctors } from "@/lib/api/patient/doctors";
import { toast } from "sonner";
import { IDoctor } from "../adminComponents/admin.doctor.list";
import { FaHeart } from "react-icons/fa";
import { Info } from "lucide-react";

export default function DoctorsList() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("General physician");
  const [doctorData, setDoctorData] = useState<IDoctor[]>([]);

  const fetchDoctors = async () => {
    try {
      const result = await getDoctors();
      console.log("Fetched Doctors:", result.data);

      if (result) {
        setDoctorData(result.data as IDoctor[]);
      } else {
        toast.error("Failed to fetch doctors.");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Something went wrong while fetching doctors.");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-teal-700">OUR DOCTORS</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10 mt-6 md:mt-8">
        {/* Filters Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Browse through the doctors specialist.</h2>
          <div className="space-y-2">
            {[
              "Gynecologist",
              "General physician",
              "Pediatricians",
              "Neurologist",
            ].map((specialty) => (
              <button
                key={specialty}
                className={`block w-full py-2 px-4 text-left border rounded-md ${
                  selectedSpecialty === specialty ? "bg-teal-500 text-white" : "bg-white"
                }`}
                onClick={() => setSelectedSpecialty(specialty)}
              >
                {specialty}
              </button>
            ))}
          </div>
          <h2 className="text-lg font-semibold">Browse through the doctors rating.</h2>
          <div>
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <div className="flex">
                  {[...Array(stars)].map((_, index) => (
                    <FaStar key={index} className="text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <h2 className="text-lg font-semibold">Browse through the doctors experience.</h2>
          <input type="range" min="1" max="20" className="w-full" />
          <h2 className="text-lg font-semibold">Browse through the doctors gender.</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="gender" className="w-4 h-4" /> Male
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="gender" className="w-4 h-4" /> Female
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="gender" className="w-4 h-4" /> others
            </label>
          </div>
        </div>

        {/* Doctor List Section */}
        <div className="md:col-span-3">
          {/* Search Bar */}
          <div className="relative w-full max-w-lg mx-auto mb-4">
            <input
              type="text"
              placeholder="Search doctors based on place"
              className="w-full py-3 px-4 border rounded-lg shadow-md"
            />
            <Search className="absolute right-4 top-3 text-gray-500" />
          </div>

          {/* Doctors List */}
          <div className="space-y-6 md:space-y-8">
            {doctorData?.length === 0 ? (
              <p className="text-center text-gray-500">No doctors found.</p>
            ) : (
              doctorData.map((doctor, index) => (
                <div key={index} className="relative flex flex-col md:flex-row items-center gap-6 p-4 md:p-6 border rounded-lg shadow-lg">
                  {/* Doctor Profile Image */}
                  <img
                    src={doctor.profileImg || "/default-doctor.png"}
                    alt={doctor.fullName}
                    className="w-24 h-24 rounded-full object-cover"
                  />

                  {/* Doctor Info */}
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold">{doctor.fullName}</h3>
                    <p className="text-sm text-gray-500">
                      {doctor.specialization}
                    </p>

                    {/* Experience and Loyal Patients Badge (Fixed) */}
                    <div className="flex items-center gap-2 mt-1">
                      {/* Experience Badge */}
                      <span className="px-2 py-1 bg-gray-200 text-xs rounded">
                        {doctor.experience} years
                      </span>

                      {/* Loyal Patients Badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-500 text-xs font-semibold rounded">
                        <FaHeart className="text-red-500" />
                        LOYAL PATIENTS
                        <Info className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-lg" />
                      ))}
                    </div>

                    <p className="text-sm text-gray-700 mt-1">
                      {doctor.street}, {doctor.city}, {doctor.state}
                    </p>

                    {/* Consultant Fee */}
                    <p className="text-sm text-gray-700 mt-1">
                      Consultant Fee: ₹{doctor.consultantFee}
                    </p>

                    {/* Available Days */}
                    <p className="text-sm text-gray-700 mt-1">
                      Available Days: {doctor.availableDays?.join(", ")}
                    </p>
                  </div>

                  {/* Appointment Buttons */}
                  <div className="mt-4 md:absolute md:top-4 md:right-4">
                    <button className="px-4 py-2 bg-teal-600 text-white rounded shadow-md">
                      SHOW SLOT AVAILABILITY
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}