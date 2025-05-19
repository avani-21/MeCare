"use client"
import DoctorAppointment from '@/components/doctorComponent/doctAppointment'
import Navbar from '@/components/doctorComponent/doctorSideBar'
import React from 'react'

function page() {
  return (
    <div>
   <Navbar>
        <DoctorAppointment/>
   </Navbar>
          
    </div>
  )
}

export default page