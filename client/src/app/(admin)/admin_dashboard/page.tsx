"use client"
import React from 'react'
import AdminNavbar from "../../../components/adminComponents/admin.sidebar"
import Dashboard from '@/components/adminComponents/admin.dashboard'

function page() {
  return (
    <>
    <AdminNavbar>
        <Dashboard/>
    </AdminNavbar>
    </>
  )
}

export default page