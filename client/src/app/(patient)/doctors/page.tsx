"use client"
import Footer from '@/components/patientComponents/footer'
import Navbar from '@/components/patientComponents/navbar'
import Doctor from '@/components/patientComponents/doctor.page'
import React from 'react'

function page() {
  return (
   <>
   <Navbar/>
   <Doctor/>
   <Footer/>
   </>
  )
}

export default page