"use client";
import { IAppointment, IReview } from "@/type/patient";
import Image from "next/image";
import { useEffect, useState } from "react";
import { addReview, getAppointmentData, getReview } from "@/lib/api/patient/patient";
import { getPrescription } from "@/lib/api/patient/doctors";
import { PrescriptionTemplate } from "@/components/patientComponents/prescription";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "sonner";

export default function AppointmentCard() {
  const [appointmentData, setAppointmentData] = useState<IAppointment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalAppointments, setTotalAppointments] = useState<number>(0);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);
const [rating, setRating] = useState<number>(0);
const [reviewText, setReviewText] = useState<string>("");
const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewReviewModalOpen, setIsViewReviewModalOpen] = useState(false);
const [existingReview, setExistingReview] = useState<IReview | null>(null);
const [isEditingReview, setIsEditingReview] = useState(false);


  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError(null);
      let response = await getAppointmentData(currentPage, itemsPerPage, filterStatus);
      
      if (response?.data?.data) {
        setAppointmentData(response.data.data.appointment);
        setTotalAppointments(response.data.data.total);
      }
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      setError(error.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptionData = async (appointmentId: string) => {
    try {
      setLoadingPrescription(true);
      const response = await getPrescription(appointmentId);
      const actualPrescription = response[0];
      
      if (actualPrescription) {
        setPrescriptionData({
          ...actualPrescription,
          medications: Array.isArray(actualPrescription.medications)
            ? actualPrescription.medications.join('\n')
            : actualPrescription.medications
        });
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching prescription data:", error);
    } finally {
      setLoadingPrescription(false);
    }
  };

  const totalPages = Math.ceil(totalAppointments / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };


  const handleReviewAdding = async () => {
    if (!selectedAppointment || !selectedAppointment._id || rating === 0)  {
      toast.error('Please select a rating');
      return;
    }
  
    try {
      setIsSubmittingReview(true);
      
      const doctorId = typeof selectedAppointment.doctorId === "string" 
        ? selectedAppointment.doctorId 
        : selectedAppointment.doctorId?._id;
  
      if (!doctorId) {
        throw new Error("Doctor ID not found");
      }
  
      const reviewData: IReview = {
        doctorId:selectedAppointment.doctorId?._id,
        patientId: selectedAppointment.patientId, 
        appointmentId: selectedAppointment._id,
        ratings: rating,
        comment: reviewText
      };
  
      const response = await addReview(reviewData);
      
      if (response) {
        toast.success('Review submitted successfully!');
        setIsReviewModalOpen(false);
        setRating(0);
        setReviewText("");
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };


const fetchReview = async () => {
  let appointmentId=selectedAppointment?._id

  if (!appointmentId) {
   console.log("Appointment ID is missing");
    return;
  }

  try {
    setLoading(true);

    const response = await getReview(appointmentId);
    if (response) {
      setExistingReview(response);
      setIsViewReviewModalOpen(true);
    } else {
      console.log("No review found for appointment:", appointmentId);
      setIsViewReviewModalOpen(false);
      setIsReviewModalOpen(true);
    }
  } catch (error) {
    console.error("Error fetching review for appointment:", appointmentId, error);
    toast.error("Failed to fetch review");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchAppointment();
  }, [currentPage, itemsPerPage, filterStatus]);

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          >
            <option value="all">All Appointments</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            {/* <option value="cancelled">Cancelled</option> */}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Loading appointments...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Appointments List */}
      {!loading && !error && (
        <>
          {appointmentData.length > 0 ? (
            appointmentData.map((appointment, index) => (
              <div
                key={index}
                className="max-w-4xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden relative"
              >
                <div className="p-4 flex items-center justify-between">
                  {/* Left Side: Doctor Info with Image */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          typeof appointment.doctorId !== "string" &&
                          appointment.doctorId?.profileImg
                            ? appointment.doctorId.profileImg
                            : "/doctor-placeholder.jpg"
                        }
                        alt={
                          typeof appointment.doctorId !== "string" &&
                          appointment.doctorId?.fullName
                            ? appointment.doctorId.fullName
                            : "Doctor"
                        }
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {(typeof appointment.doctorId !== "string" &&
                          appointment.doctorId?.fullName) ||
                          "Dr. Richard James"}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {(typeof appointment.doctorId !== "string" &&
                          appointment.doctorId?.specialization) ||
                          "General physician"}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Payment Status and Prescription Button */}
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-medium ${
                        appointment.paymentStatus === "paid"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {appointment.paymentStatus || "PAID"}
                    </span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        appointment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {appointment.status || "booked"}
                    </span>
                    {appointment.status === "completed" && (
                      <button
                        onClick={() => fetchPrescriptionData(appointment?._id)}
                        disabled={loadingPrescription}
                        className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded text-sm disabled:opacity-50"
                      >
                        {loadingPrescription ? "Loading..." : "Show Prescription"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Address and Date & Time */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm">
                  <div className="mb-2">
                    <h3 className="font-medium text-gray-500">Address:</h3>
                    <p className="text-gray-700">
                      {typeof appointment.doctorId !== "string" &&
                        appointment.doctorId?.street}
                      ,{" "}
                      {typeof appointment.doctorId !== "string" &&
                        appointment.doctorId?.city}
                      ,{" "}
                      {typeof appointment.doctorId !== "string" &&
                        appointment.doctorId?.pincode}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Date & Time:</h3>
                    <p className="text-gray-700">
                      {new Date(appointment.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      | {appointment.startTime} to {appointment.endTime}
                    </p>
                  </div>
                </div>


{appointment.status === "completed" && (
 <>
  <button
    onClick={() => {
      setSelectedAppointment(appointment);
      setIsReviewModalOpen(true);
    }}
    className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded text-sm disabled:opacity-50 ml-2"
  >
    Add Review
  </button>

    <button
      onClick={() => {
        setSelectedAppointment(appointment);
        fetchReview();
      }}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm ml-2"
    >
      Show Review
    </button>
 </>
)}
              </div>
            ))
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No appointments found with the selected filter.</p>
            </div>
          )}
        </>
      )}

      {/* Prescription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Prescription Details
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {loadingPrescription ? (
                <p>Loading prescription...</p>
              ) : prescriptionData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Patient Name:</h4>
                      <p>{prescriptionData.patientId?.name || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Doctor Name:</h4>
                      <p>{prescriptionData.doctorId?.fullName || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Diagnosis:</h4>
                    <p>{prescriptionData.diagnosis || "N/A"}</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Medications</label>
                    <textarea
                      value={prescriptionData.medications || ""}
                      readOnly
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                      rows={4}
                    />
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Instructions:</h4>
                    <p>{prescriptionData.instructions || "N/A"}</p>
                  </div>

                  <div className="flex justify-end mt-4">
                    <PDFDownloadLink
                      document={<PrescriptionTemplate prescription={prescriptionData} />}
                      fileName={`prescription-${prescriptionData?.patientId?._id || 'patient'}.pdf`}
                    >
                      {({ loading }) => (
                        <button
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-md transition duration-300"
                          disabled={loading}
                        >
                          {loading ? 'Generating PDF...' : 'Download Prescription'}
                        </button>
                      )}
                    </PDFDownloadLink>
                  </div>
                </div>
              ) : (
                <p>No prescription data available</p>
              )}
            </div>
          </div>
        </div>
      )}

{/* Review Modal */}
{isReviewModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center p-4 z-50 ">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Add Review for Dr. {
              typeof selectedAppointment?.doctorId !== "string" 
                ? selectedAppointment?.doctorId?.fullName 
                : "Doctor"
            }
          </h3>
          <button
            onClick={() => {
              setIsReviewModalOpen(false);
              setRating(0);
              setReviewText("");
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-gray-700 mb-2">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="review-text" className="block text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={4}
              placeholder="Share your experience..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => {
                setIsReviewModalOpen(false);
                setRating(0);
                setReviewText("");
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReviewAdding}
              disabled={isSubmittingReview}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* View Review Modal */}
{isViewReviewModalOpen && existingReview && (
  <div className="fixed inset-0 flex items-center justify-center p-4 z-50 b">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Your Review for Dr. {
              typeof selectedAppointment?.doctorId !== "string" 
                ? selectedAppointment?.doctorId?.fullName 
                : "Doctor"
            }
          </h3>
          <button
            onClick={() => {
              setIsViewReviewModalOpen(false);
              setIsEditingReview(false);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isEditingReview ? (
          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="review-text" className="block text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={4}
                placeholder="Share your experience..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  setIsEditingReview(false);
                  setRating(existingReview.ratings);
                  setReviewText(existingReview.comment || "");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewAdding}
                disabled={isSubmittingReview}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                {isSubmittingReview ? 'Updating...' : 'Update Review'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Star Rating Display */}
            <div>
              <label className="block text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-6 h-6 ${star <= existingReview.ratings ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Review Text Display */}
            <div>
            <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={4}
                placeholder="Share your experience..."
              />
            </div>

            {/* Edit Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setIsEditingReview(true);
                  setRating(existingReview.ratings);
                  setReviewText(existingReview.comment || "");
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
      {/* Pagination */}
      {!loading && !error && totalAppointments > 0 && (
        <div className="flex justify-center mt-4">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 border-t border-b border-gray-300 ${
                  currentPage === number
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() =>
                paginate(currentPage < totalPages ? currentPage + 1 : totalPages)
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}