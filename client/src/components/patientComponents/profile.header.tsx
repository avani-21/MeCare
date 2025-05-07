"use client"
import { getProfile } from "@/lib/api/patient/patient";
import { IPatient } from "@/type/patient";
import Image from "next/image";
import { useEffect, useState } from "react";

const ProfileHeader = () => {
  const [patientData, setPatientData] = useState<IPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      console.log(response)
      if (response.data.data) {
        setPatientData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  // if (loading) {
  //   return (
  //     <div className="flex justify-center">
  //       <div className="flex items-center gap-4">
  //         <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
  //         <div className="flex flex-col gap-2">
  //           <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
  //           <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

 

  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full overflow-hidden relative">
  <Image
    src={patientData?.profileImage || "/user.jpg"}
    alt="Profile"
    fill
    className="object-cover"
  />
</div>

        <div className="flex flex-col">
          <p className="text-gray-500 text-sm">Hello,</p>
          <p className="text-xl font-semibold text-black">
            {patientData?.name || "Guest"}
          </p>
          {patientData?.email && (
            <p className="text-sm text-gray-600">{patientData.email}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;