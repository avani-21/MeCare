"use client"
import React from 'react'
import AdminNavbar from '@/components/adminComponents/admin.sidebar'
import PatientTable from '@/components/adminComponents/admin.patient'

function page() {
  return (
  <>
  <AdminNavbar>
    <PatientTable/>
  </AdminNavbar>
  </>
  )
}

export default page