import Footer from '@/components/patientComponents/footer'
import Navbar from '@/components/patientComponents/navbar'
import Payment from "@/components/patientComponents/payment"
import React from 'react'

function page() {
  return (
    <div>
        <Navbar/>
        <Payment/>
        <Footer/>
    </div>
  )
}

export default page