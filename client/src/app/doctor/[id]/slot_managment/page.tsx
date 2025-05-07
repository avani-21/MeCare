"use client"
import React from 'react'
import Navbar from "@/components/doctorComponent/doctorSideBar"
import Slots from "@/components/doctorComponent/doctorSlots"
import { SlotFormData } from '@/type/doctor'

function page() {
  return (
    <div>
     <Navbar>
        <Slots />
     </Navbar>
    </div>
  )
}

export default page