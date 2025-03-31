"use client"
import React from 'react'
import AdminNavbar from "../../../components/adminComponents/admin.sidebar"
import DoctorRegistration from '@/components/adminComponents/doctor.register.form'
function page() {
  return (
   <>
   <AdminNavbar>
    <DoctorRegistration/>
   </AdminNavbar>
  
   </>
  )
}

export default page