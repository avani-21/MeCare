import React from 'react'
import Navbar from '@/components/patientComponents/navbar'
import OTPVerification from '@/components/patientComponents/otp.verification'

function page() {
  return (
    <div>
      <Navbar/>
      <OTPVerification/>
    </div>
  )
}

export default page
