'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createPrescription, getDoctorAppointment, getPrescription, updateAppointmentStatus } from '@/lib/api/doctor/doctor';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

function DoctorAppointment() {
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medications: '',
    instructions: '',
  });

  const params = useParams();
  const id = params?.id as string;

  const fetchData = async () => {
    try {
      let response = await getDoctorAppointment(id);
      if (response) {
        setAppointments(response);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const filteredAppointments = appointments.filter((app) => {
    const query = searchQuery.toLowerCase();
    const patientName = app?.patientId?.name?.toLowerCase() || '';
    const patientEmail = app?.patientId?.email?.toLowerCase() || '';
    const appointmentId = app?._id?.toLowerCase() || '';
    return (
      patientName.includes(query) ||
      patientEmail.includes(query) ||
      appointmentId.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const openPrescriptionModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsPrescriptionModalOpen(true);
  };

  const closePrescriptionModal = () => {
    setIsPrescriptionModalOpen(false);
    setPrescriptionData({
      diagnosis: '',
      medications: '',
      instructions: '',
    });
  };

  console.log("current ",currentPrescription)

  const handleSavePrescription =async  () => {
    try {
      if (!selectedAppointment) return;
      const prescriptionToSend = {
        appointmentId: selectedAppointment._id,
        patientId: selectedAppointment.patientId._id,
        diagnosis: prescriptionData.diagnosis,
        medications: prescriptionData.medications,
        instructions: prescriptionData.instructions,
      };
      const response=await createPrescription(prescriptionToSend)
      if(response){
        toast.success('Prescription created successfully');
        closePrescriptionModal();
        fetchData();
      }
    } catch (error:any) {
      toast.error('Failed to create prescription');
    console.error('Error saving prescription:', error);
    }
   
  };

  const handleShowPrescription = async (appointmentId: string) => {
    try {
      const prescription = await getPrescription(appointmentId);
      console.log("Prescription response:", prescription); 
  
      const actualPrescription = prescription[0]; // 👈 picking from key 0
  
      if (actualPrescription) { 
        setCurrentPrescription({
          ...actualPrescription,
  
          medications: Array.isArray(actualPrescription.medications) 
            ? actualPrescription.medications.join('\n') 
            : actualPrescription.medications
        });
        setShowPrescriptionModal(true);
      } else {
        toast.info('No prescription found for this appointment');
      }
    } catch (error) {
      toast.error('Failed to fetch prescription');
      console.error('Error fetching prescription:', error);
    }
  };
  
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await updateAppointmentStatus(appointmentId, newStatus);
      if (response) {
        toast.success('Appointment status updated successfully');
        fetchData();
      } else {
        toast.error('Failed to update appointment status');
      }
    } catch (error) {
      toast.error('Error updating appointment status');
      console.error(error);
    }
  };

  const currentAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="overflow-x-auto">
      <div className="p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm"
        />
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead>
          <tr className="bg-teal-700 text-white">
            <th className="px-4 py-3 text-left">Appointment ID</th>
            <th className="px-4 py-3 text-left">Patient</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Age</th>
            <th className="px-4 py-3 text-left">Date & Time</th>
            <th className="px-4 py-3 text-left">Payment Status</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentAppointments.map((appointment) => (
            <tr key={appointment._id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-4 font-medium text-gray-700">#{appointment._id.slice(14)}</td>
              <td className="px-4 py-4 flex items-center space-x-4">
                <Image
                  src={appointment.patientId.profileImage || '/patient-placeholder.jpg'}
                  alt={appointment.patientId.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">{appointment.patientId.name}</p>
                  <p className="text-sm text-gray-500">{appointment.patientId.phone}</p>
                </div>
              </td>
              <td className="px-4 py-4">{appointment.patientId.email}</td>
              <td className="px-4 py-4">{appointment.patientId.age}</td>
              <td className="px-4 py-4">
                {new Date(appointment.date).toLocaleDateString()} | {appointment.startTime} to {appointment.endTime}
              </td>
              <td className="px-8 py-4">
                <span className={`px-3 py-1 rounded-full text-center text-xs ${
                  appointment.paymentStatus === 'paid' ? 'bg-green-200 text-green-800' :
                    appointment.status === 'unpaid' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                }`}>
                  {appointment.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 rounded-full text-xs bg-teal-800 text-white `}>
                  {appointment.status}
                </span>
              </td>
              <td className="px-4 py-4 flex flex-col gap-2">
                {appointment.status === 'completed' ? (
                  <>
                    <button
                      onClick={() => openPrescriptionModal(appointment)}
                      className="px-3 py-1 bg-teal-600 text-white text-xs hover:bg-teal-700 transition-colors duration-200"
                    >
                      Add Prescription
                    </button>

                    <button
                      onClick={() => handleShowPrescription(appointment._id)}
                      className="px-3 py-1 bg-teal-600 text-white text-xs hover:bg-teal-700 transition-colors duration-200"
                    >
                      Show
                    </button>
                  </>

                  
                ) : (
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleStatusChange(appointment._id, e.target.value);
                      }
                    }}
                    className="px-2 py-1 border rounded text-sm bg-teal-700 text-white hover:bg-teal-300 transition-colors duration-200"
                  >
                    <option value="">Select Status</option>
                    {/* {appointment.status !== 'cancelled' && (
                      <option value="cancelled" className="bg-white text-gray-900">Cancelled</option>
                    )} */}
                    <option value="completed" className="bg-white text-gray-900">Completed</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
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
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      </div>
      {/* Prescription Modal */}
      {isPrescriptionModalOpen && selectedAppointment && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Add Prescription</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Patient: {selectedAppointment.patientId.name}</label>
              <label className="block text-gray-700 mb-2">Appointment Date: {new Date(selectedAppointment.date).toLocaleDateString()}</label>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Diagnosis</label>
              <textarea
                value={prescriptionData.diagnosis}
                onChange={(e) => setPrescriptionData({...prescriptionData, diagnosis: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Enter diagnosis..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Medications</label>
              <textarea
                value={prescriptionData.medications}
                onChange={(e) => setPrescriptionData({...prescriptionData, medications: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Enter medications (one per line or comma separated)..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Instructions</label>
              <textarea
                value={prescriptionData.instructions}
                onChange={(e) => setPrescriptionData({...prescriptionData, instructions: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Enter patient instructions..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closePrescriptionModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrescription}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Save Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Prescription Modal */}
{showPrescriptionModal && currentPrescription && (
  <div className="fixed inset-0 flex items-center justify-center z-50 ">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Prescription Details</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Patient: {currentPrescription?.patientId.name}</label>
        <label className="block text-gray-700 mb-2">Date: {new Date(currentPrescription.createdAt).toLocaleDateString()}</label>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-semibold">Diagnosis</label>
        <div className="w-full px-3 py-2 border rounded-lg bg-gray-50">
          {currentPrescription.diagnosis}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-semibold">Medications</label>
        <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 whitespace-pre-line">
          {currentPrescription.medications}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-semibold">Instructions</label>
        <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 whitespace-pre-line">
          {currentPrescription.instructions}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowPrescriptionModal(false)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default DoctorAppointment;