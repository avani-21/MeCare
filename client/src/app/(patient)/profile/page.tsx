"use client"
import Footer from '@/components/patientComponents/footer'
import Navbar from '@/components/patientComponents/navbar'
import ProfileHeader from '@/components/patientComponents/profile.header'
import ProfileNav from '@/components/patientComponents/profile.navbar'
import UserProfile from '@/components/patientComponents/profileData'
import React, { useEffect } from 'react'
import { useRouter } from "next/navigation";

function page() {
const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("patientToken") 
      : null;

    if (!token) {
      router.push("/login"); 
    }
  }, [router]);

  return (
    <div>
        <Navbar/>
        <ProfileHeader/>
        <ProfileNav/>
        <UserProfile/>
        <Footer/>
    </div>
  )
}

export default page