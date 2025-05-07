"use client"
import Navbar from '@/components/patientComponents/navbar'
import PatientLogin from '@/components/patientComponents/patient.login'
import React from 'react'

function page() {
  return (
    <div>
        <Navbar/>
        <PatientLogin/>
    </div>
  )
}

export default page
