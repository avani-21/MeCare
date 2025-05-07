'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function PaymentSuccess() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/profile/my_appointments')
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white text-center px-4">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-teal-700 rounded-md p-2">
          <CheckCircle className="text-white w-6 h-6" />
        </div>
        <h1 className="ml-3 text-lg font-semibold text-green-700 whitespace-nowrap">
          APPOINTMENT BOOKED SUCCESSFULLY
        </h1>
      </div>

      <button
        onClick={handleClick}
        className="px-5 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition"
      >
        MY APPOINTMENT
      </button>
    </div>
  )
}
