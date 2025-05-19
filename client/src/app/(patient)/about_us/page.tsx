import React from 'react'
import PatientNav from "@/components/patientComponents/navbar"
import Footer from '@/components/patientComponents/footer'
import Image from 'next/image'
import DoctorTeam from "../../../../public/doctor-team.png"

function page() {
      return (
    <>
    <PatientNav/>
        <section className="py-12 px-6 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Image */}
        <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-md">
          <Image
            src={DoctorTeam} 
            alt="Doctor team"
            fill
            className="object-cover"
          />
        </div>

     
        <div>      <h2 className="text-3xl font-bold mb-6">  <span className="text-cyan-500">ABOUT</span> <span className="text-teal-500">US</span></h2>
    
          <p className="text-gray-700 mb-4">
            Welcome To Prescripto, Your Trusted Partner In Managing Your Healthcare Needs Conveniently And Efficiently. At Prescripto, We Understand The Challenges Individuals Face When It Comes To Scheduling Doctor Appointments And Managing Their Health Records.
          </p>
          <p className="text-gray-700 mb-4">
            Prescripto is Committed To Excellence In Healthcare Technology. We Continuously Strive To Enhance Our Platform, Integrating The Latest Advancements To Improve User Experience And Deliver Superior Service. Whether You're Booking Your First Appointment Or Managing Ongoing Care, Prescripto Is Here To Support You Every Step Of The Way.
          </p>
          <h3 className="text-xl text-teal-700 font-semibold mt-6 mb-2">Our Vision</h3>
          <p className="text-gray-700">
            Our Vision At Prescripto Is To Create A Seamless Healthcare Experience For Every User. We Aim To Bridge The Gap Between Patients And Healthcare Providers, Making It Easier For You To Access The Care You Need, When You Need It.
          </p>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-10">  <span className="text-cyan-500">WHY</span> <span className="text-teal-500">CHOOSE US</span></h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition duration-200">
            <h4 className="text-xl font-semibold mb-2">EFFICIENCY:</h4>
            <p className="text-gray-600">Streamlined Appointment Scheduling That Fits Into Your Busy Lifestyle.</p>
          </div>
          {/* Card 2 */}
          <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition duration-200">
            <h4 className="text-xl font-semibold mb-2">CONVENIENCE:</h4>
            <p className="text-gray-600">Access To A Network Of Trusted Healthcare Professionals In Your Area.</p>
          </div>
          {/* Card 3 */}
          <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition duration-200">
            <h4 className="text-xl font-semibold mb-2">PERSONALIZATION:</h4>
            <p className="text-gray-600">Tailored Recommendations And Reminders To Help You Stay On Top Of Your Health.</p>
          </div>
        </div>
      </div>
    </section>
    <Footer/>
    </>
  )
}



export default page