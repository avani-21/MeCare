"use client"
import Footer from '@/components/patientComponents/footer'
import Navbar from '@/components/patientComponents/navbar'
import React from 'react'
import SIngleDoctor from "@/components/patientComponents/doctor.single.page"
import { useParams } from 'next/navigation';

function page() {

  const params = useParams();
  const { id } = params as { id: string };
  return (
    <>
    <Navbar/>
      <SIngleDoctor params={{id}}/>
    <Footer/>
    </>
  )
}

export default page