import React from 'react'
import NavBar from '@/components/doctorComponent/doctorSideBar'
import Reviews from '@/components/doctorComponent/doctorReviews'

function page() {
  return (
    <>
    <NavBar>
        <Reviews/>
    </NavBar>

    </>
  )
}

export default page