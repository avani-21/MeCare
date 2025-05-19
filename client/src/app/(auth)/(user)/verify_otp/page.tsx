"use client"
import Navbar from '@/components/patientComponents/navbar'
import EmailVerify from "@/components/patientComponents/emailverification"
import React from 'react'

function page() {
  return (
    <div>
<Navbar/>
<EmailVerify/>

    </div>
  )
}

export default page