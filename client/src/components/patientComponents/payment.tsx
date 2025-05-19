"use client";

import { getAppointment, markAsPaid } from '@/lib/api/patient/patient';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Appointment } from '@/type/patient';
import { loadStripe } from '@stripe/stripe-js';
import { checkOut } from '@/lib/api/patient/patient';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ConfirmBooking() {
  const [appointmentData, setAppointmentData] = useState<Appointment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAppointmentData = async () => {
    const response = await getAppointment();
    console.log("appointmentdata", response);
    setAppointmentData(response?.data?.data);
  };

  const paymentStrip=async ()=>{
       if(!appointmentData) return;
 setIsProcessing(true);

 try {
     const response=await checkOut(appointmentData.amount,appointmentData.doctorId.fullName)
    
     const {sessionId}=response

    const stripe = await stripePromise;
    if(stripe){
        let response=await markAsPaid()
        console.log(response);
    }
    const {error}=await stripe!.redirectToCheckout({sessionId})
    if(error){
        throw error
    }
 } catch (error:any) {
    setIsProcessing(false);
    console.error('Payment error:', error);
    toast.error("Payment failed. Please try again.")
 }finally{
    setIsProcessing(false); 
 }
  }

  useEffect(() => {
    fetchAppointmentData();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-2xl shadow-lg border p-6">
        <h2 className="text-2xl font-semibold text-center text-teal-600 mb-6">Confirm Booking</h2>

        {appointmentData && (
          <>
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 rounded-lg overflow-hidden bg-teal-600 flex-shrink-0">
                <Image
                  src={appointmentData.doctorId?.profileImg || "/doctor.jpg"}
                  alt="Doctor"
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex flex-col">
                <h3 className="text-lg font-medium">{appointmentData.doctorId?.fullName}</h3>
                <p className="text-gray-600 text-sm">{appointmentData.doctorId?.specialization}</p>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm text-gray-800">
              <p>
                Appointment Day:{' '}
                <span className="font-medium">
                  {new Date(appointmentData.date).toLocaleDateString()} 
                </span>
              </p>

              <p>
                Appointment Time:{' '}
                <span className="font-medium">
                    {appointmentData.startTime} to {appointmentData.endTime}
                </span>
              </p>
              <p>
                Appointment booking fee: <span className="font-medium">₹{appointmentData.amount}</span>
              </p>
            </div>

            <div className="mt-6 flex items-center space-x-2">
              <input type="radio" name="payment" id="razorpay" checked readOnly />

              <label htmlFor="razorpay" className="flex items-center">
                {/* <Image src="/razorpay.svg" alt="Razorpay" width={80} height={30} /> */}
                Stripe
              </label>
            </div>

            <button
              className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-xl transition"
                onClick={paymentStrip}
                disabled={isProcessing}
            >
              Proceed to Pay
            </button>

            <p className="text-xs text-center text-red-500 mt-4">
              No refund of appointment fee in case of cancellation
            </p>
          </>
        )}
      </div>
    </div>
  );
}
