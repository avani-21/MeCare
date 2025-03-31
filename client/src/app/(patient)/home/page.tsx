import React from 'react'
import Navbar from '@/components/patientComponents/navbar'
import Banner1 from '@/components/patientComponents/banner'
import Banner2 from '@/components/patientComponents/banner2'
import Spacialities from '@/components/patientComponents/spacialities'
import Footer from "@/components/patientComponents/footer"

function page() {
  return (
    <div>
        <Navbar/>
       <Banner1/>
       <Spacialities/>
       <Banner2/>
       <Footer/>

    </div>
  )
}

export default page
