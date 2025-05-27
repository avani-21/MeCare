"use client"
import { getProfile } from "@/lib/api/patient/patient";
import { IPatient } from "@/type/patient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { cookies } from "next/headers";
import img from "../../../public/logo.png"

const ProfileHeader = () => {
  const [patientData, setPatientData] = useState<IPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router=useRouter()


  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
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
     const token = localStorage.getItem("patientToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchPatientData();
  }, [router]);

   


 useEffect(()=>{
  if(patientData?.isBlock){
    document.cookie = 'patientToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    localStorage.removeItem("patientToken")
    localStorage.removeItem("patientId")
  }
 },[])

  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full overflow-hidden relative">
  <Image
    src={patientData?.profileImage || img }
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