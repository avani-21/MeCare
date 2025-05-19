import Footer from '@/components/patientComponents/footer'
import Navbar from '@/components/patientComponents/navbar'
import PaymentSuccess from '@/components/patientComponents/payment.success'
import React from 'react'

function page() {
  return (
    <div>
        <Navbar/>
          <PaymentSuccess/>
        <Footer/>
    </div>
  )
}

export default page