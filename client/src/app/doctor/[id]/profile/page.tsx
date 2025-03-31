"use clinet"
import React from 'react'
import DocNav from '@/components/doctorComponent/doctorSideBar'
import Profile from '@/components/doctorComponent/profile'

function page() {
  return (
    <>
    <DocNav>
   <Profile/>
    </DocNav>
    </>
  )
}

export default page