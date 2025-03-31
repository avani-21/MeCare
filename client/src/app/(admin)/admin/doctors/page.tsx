"use client"
import AdminNavbar from '@/components/adminComponents/admin.sidebar'
import DoctorListing from '@/components/adminComponents/admin.doctor.list'
import React from 'react'

function page() {
  return (
    <>
    <AdminNavbar>
       <DoctorListing/>
    </AdminNavbar>
    </>
  )
}

export default page