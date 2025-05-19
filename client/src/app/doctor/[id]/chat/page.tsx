"use clinet"
import React from 'react'
import DocNav from '@/components/doctorComponent/doctorSideBar'
import Chat from '@/components/doctorComponent/doctorChat'

function page() {
  return (
    <>
    <DocNav>
      <Chat/>
    </DocNav>
    </>
  )
}

export default page