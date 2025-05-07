"use client"
import React from 'react'
import Navbar from '@/components/doctorComponent/doctorSideBar'
import DoctorDashboard from '@/components/doctorComponent/doctorDashboard'

function page() {
  return (
    <>
    <Navbar>
     <DoctorDashboard/>
    </Navbar>
    </>
  )
}

export default page