'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createPrescription, getDoctorAppointment, getPrescription, updateAppointmentStatus } from '@/lib/api/doctor/doctor';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

function DoctorAppointment() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medications: [] as Medication[],
    instructions: '',
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const params = useParams();
  const id = params?.id as string;

  const fetchData = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const response = await getDoctorAppointment(
        page,
        itemsPerPage,
        filterStatus !== 'all' ? filterStatus : 'all',
        startDate ? startDate.toISOString() : undefined,
        endDate ? endDate.toISOString() : undefined,
        searchQuery.trim()
      );
      if (response) {
        setAppointments(response.data.appointments);
        setTotalAppointments(response.data.total);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error('Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [filterStatus, startDate, endDate, searchQuery]);

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setCurrentPage(1);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setCurrentPage(1);
  };

  const clearDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalAppointments / itemsPerPage);

  const openPrescriptionModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setPrescriptionData({
      diagnosis: '',
      medications: [],
      instructions: '',
    });
    setIsPrescriptionModalOpen(true);
  };

  const closePrescriptionModal = () => {
    setIsPrescriptionModalOpen(false);
    setPrescriptionData({
      diagnosis: '',
      medications: [],
      instructions: '',
    });
    setSelectedAppointment(null);
  };

  const addNewMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dosage: '', frequency: '', duration: '' }
      ]
    }));
  };

  const removeMedication = (index: number) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    setPrescriptionData(prev => {
      const updatedMedications = [...prev.medications];
      updatedMedications[index] = {
        ...updatedMedications[index],
        [field]: value
      };
      return { ...prev, medications: updatedMedications };
    });
  };

  const handleSavePrescription = async () => {
    try {
      if (!selectedAppointment) return;
      const prescriptionToSend = {
        appointmentId: selectedAppointment._id,
        patientId: selectedAppointment.patientId._id,
        diagnosis: prescriptionData.diagnosis,
        medications: prescriptionData.medications,
        instructions: prescriptionData.instructions,
      };
      const response = await createPrescription(prescriptionToSend);
      if (response) {
        toast.success('Prescription created successfully');
        closePrescriptionModal();
        fetchData();
      }
    } catch (error: any) {
      toast.error('Failed to create prescription');
      console.error('Error saving prescription:', error);
    }
  };

  const handleShowPrescription = async (appointmentId: string) => {
    try {
      const prescription = await getPrescription(appointmentId);
      const actualPrescription = prescription[0];
      if (actualPrescription) {
        setCurrentPrescription(actualPrescription);
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
      }
    } catch (error) {
      toast.error('Error updating appointment status');
      console.error(error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="p-4 flex flex-col md:flex-row gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by patient name, email, or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border rounded-lg shadow-sm"
        />

        <select
          value={filterStatus}
          onChange={handleStatusFilterChange}
          className="px-4 py-2 border rounded-lg shadow-sm"
        >
          <option value="all">All Statuses</option>
          <option value="booked">Booked</option>
          <option value="completed">Completed</option>
        </select>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Start date"
              className="w-full px-4 py-2 border rounded-lg shadow-sm"
            />
            {startDate && (
              <button
                onClick={() => setStartDate(null)}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>

          <div className="relative">
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="End date"
              className="w-full px-4 py-2 border rounded-lg shadow-sm"
            />
            {endDate && (
              <button
                onClick={() => setEndDate(null)}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>

          {(startDate || endDate) && (
            <button
              onClick={clearDateFilters}
              className="px-3 py-2 text-sm text-teal-600 hover:text-teal-800"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <>
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
              {appointments && appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <tr key={appointment._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-700">{appointment.appointmentId}</td>
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
                        appointment.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs bg-teal-800 text-white`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex flex-col gap-2">
                      {appointment.status === 'completed' ? (
                        <>
                          {!appointment.prescriptionId ? (
                            <button
                              onClick={() => openPrescriptionModal(appointment)}
                              className="px-3 py-1 bg-teal-600 text-white text-xs hover:bg-teal-700 transition-colors duration-200"
                            >
                              Add Prescription
                            </button>
                          ) : (
                            <button
                              onClick={() => handleShowPrescription(appointment._id)}
                              className="px-3 py-1 bg-teal-600 text-white text-xs hover:bg-teal-700 transition-colors duration-200"
                            >
                              View Prescription
                            </button>
                          )}
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
                          <option value="completed" className="bg-white text-gray-900">Completed</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                  fetchData(currentPage - 1);
                }
              }}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => {
                  setCurrentPage(number);
                  fetchData(number);
                }}
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
              onClick={() => {
                if (currentPage < totalPages) {
                  setCurrentPage(currentPage + 1);
                  fetchData(currentPage + 1);
                }
              }}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {isPrescriptionModalOpen && selectedAppointment && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Prescription</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Patient: {selectedAppointment.patientId.name}</label>
              <label className="block text-gray-700 mb-2">Appointment Date: {new Date(selectedAppointment.date).toLocaleDateString()}</label>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Diagnosis</label>
              <textarea
                value={prescriptionData.diagnosis}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Enter diagnosis..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Medications</label>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-teal-700 text-white">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Dosage</th>
                      <th className="px-4 py-2 text-left">Frequency</th>
                      <th className="px-4 py-2 text-left">Duration</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionData.medications.map((med, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="Medication name"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="e.g., 500mg"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="e.g., Twice daily"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="e.g., 7 days"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => removeMedication(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={addNewMedication}
                className="mt-2 px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
              >
                + Add Medication
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Instructions</label>
              <textarea
                value={prescriptionData.instructions}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, instructions: e.target.value })}
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

      {showPrescriptionModal && currentPrescription && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Prescription Details</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Patient: {currentPrescription.patientId?.name}</label>
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
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-teal-700 text-white">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Dosage</th>
                      <th className="px-4 py-2 text-left">Frequency</th>
                      <th className="px-4 py-2 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPrescription.medications.map((med: Medication, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">{med.name}</td>
                        <td className="px-4 py-2">{med.dosage}</td>
                        <td className="px-4 py-2">{med.frequency}</td>
                        <td className="px-4 py-2">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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