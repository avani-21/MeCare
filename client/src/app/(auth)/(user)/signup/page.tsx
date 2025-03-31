import React from 'react'
import Navbar from '@/components/patientComponents/navbar'
import PatientSignup from '@/components/patientComponents/patient.signup'

function page() {
  return (
    <div>
      <Navbar/>
      <PatientSignup/>
    </div>
  )
}

export default page
