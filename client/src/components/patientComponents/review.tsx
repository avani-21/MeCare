"use client";
import { getReviews } from "@/lib/api/patient/patient";
import { Reviews } from "@/type/patient";
import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";

interface DoctorReviewsProps {
  doctorId: string;
}

export default function DoctorReviews({ doctorId }: DoctorReviewsProps) {
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
     const response=await getReviews(doctorId)
     if(response){
        setReviews(response.data)
     }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [doctorId]);


  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="mt-8">
<h1 className="text-2xl text-teal-700 font-bold mb-6">MY REVIEWS</h1>
      
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <>
        <div className="space-y-10">
  {currentReviews.map((review, index) => (
    <div key={index} className="relative bg-gray-100 p-6 rounded-2xl shadow-md pl-24">
      {/* Profile Image */}
      <div className="absolute -left-10 top-6">
        <img
          src={review.patientId?.profileImage || '/default-profile.png'}
          alt="profile"
          className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
        />
      </div>

      {/* Name and Dot */}
      <div className="flex items-center mb-1">
        <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
          {review.patientId?.name || "Anonymous"}
        </h3>
      
      </div>

      {/* Star Rating */}
      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-lg ${i < review.ratings ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>

      {/* Comment */}
      <p className="text-gray-800 font-medium text-base leading-relaxed">
        {review.comment}
      </p>
    </div>
  ))}
</div>


          {/* Dot Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-3 h-3 rounded-full ${currentPage === page ? 'bg-teal-600' : 'bg-gray-300'}`}
                  aria-label={`Go to page ${page}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}