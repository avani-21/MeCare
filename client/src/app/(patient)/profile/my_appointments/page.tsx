import AppointmentCard from '@/components/patientComponents/appointment.card'
import Footer from '@/components/patientComponents/footer'
import Navbar from '@/components/patientComponents/navbar'
import ProfileHeader from '@/components/patientComponents/profile.header'
import ProfileNav from '@/components/patientComponents/profile.navbar'
import React from 'react'

function page() {
  return (
    <div>
        <Navbar/>
        <ProfileHeader/>
        <ProfileNav/>
        <AppointmentCard/>
        <Footer/>
    </div>
  )
}

export default page