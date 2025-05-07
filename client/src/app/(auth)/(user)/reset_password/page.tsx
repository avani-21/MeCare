"use client"
import Navbar from '@/components/patientComponents/navbar'
import ResetPassword from '@/components/patientComponents/reset.password'
import React from 'react'

function page() {
  return (
    <div>
        <Navbar/>
        <ResetPassword/>
    </div>
  )
}

export default page