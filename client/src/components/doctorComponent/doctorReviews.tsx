"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { getReviews } from '@/lib/api/doctor/doctor'
import { Reviews } from '@/type/patient'

function doctorReviews() {
  const [reviews,setReviews]=useState<Reviews[]>([])

  const getReview=async ()=>{
    let response=await getReviews()
    if(response){
      setReviews(response.data)
    }
  }

useEffect(()=>{
  getReview()
},[])

  return (
    <div>
      <div className="overflow-x-auto">
  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
    <thead>
      <tr className="bg-teal-700 text-white rounded">
        <th className="px-4 py-3 text-left">User</th>
        <th className="px-4 py-3 text-left">Email</th>
        <th className="px-4 py-3 text-left">Rating</th>
        <th className="px-4 py-3 text-left">Comment</th>
      </tr>
    </thead>
    <tbody>
      {reviews.map((review) => (
        <tr key={review._id} className="border-b border-gray-200 hover:bg-gray-50">
          <td className="px-4 py-4 flex items-center space-x-3">
            <Image
              src={review?.patientId?.profileImage || '/default-avatar.png'}
              alt="patient profile"
              width={40}
              height={60}
              className="rounded-full"
            />
            <span className="font-medium">{review?.patientId?.name}</span>
          </td>
          <td className="px-4 py-4 text-gray-600">{review?.patientId?.email}</td>
          <td className="px-4 py-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < review.ratings ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-gray-600">({review.ratings})</span>
            </div>
          </td>
          <td className="px-4 py-4 text-gray-600 max-w-[300px] truncate">
            {review.comment}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
  )
}

export default doctorReviews
