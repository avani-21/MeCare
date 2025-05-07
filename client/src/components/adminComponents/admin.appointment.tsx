'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getDoctorAppointment } from '@/lib/api/doctor/doctor';
import { useParams } from 'next/navigation';
import { getAllAppointments } from '@/lib/api/admin/appointments';
import page from '@/app/page';
import { toast } from 'sonner';
import { IAppointment } from '@/type/patient';


function DoctorAppointment() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);


  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);


  const params = useParams();
  const id = params?.id as string; 
  
    const fetchData = async () => {
        try {
            let response=await getAllAppointments(currentPage,itemsPerPage)
            if(response){
                setAppointments(response)
            }
        } catch (error) {
              toast.error("Error occuered while fetching data")
        }
      };


  useEffect(() => {
  
    fetchData();
  }, []);

 
  const filteredAppointments = appointments.filter((app) => {
    const query = searchQuery.toLowerCase();
  
    const patientName = app?.patientId?.name?.toLowerCase() || '';
    const doctorName = app?.doctorId?.fullName?.toLowerCase() || '';
    const patientEmail = app?.patientId?.email?.toLowerCase() || '';
    const appointmentId = app?._id?.toLowerCase() || '';
  
    return (
      patientName.includes(query) ||
      doctorName.includes(query) ||
      patientEmail.includes(query) ||
      appointmentId.includes(query)
    );
  });
  

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };


  const openDetailsModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  const openCancelModal = (appointment: any) => {
    // Cancel logic here
  };


  const currentAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="overflow-x-auto">
      <div className="p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by patient name, doctor name , or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm"
        />
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm text-sm">
  <thead>
    <tr className="bg-teal-700 text-white text-left">
      <th className="px-4 py-3 w-40">Appointment ID</th>
      <th className="px-4 py-3 w-64">Patient</th>
      <th className="px-4 py-3 w-64">Doctor</th>
      <th className="px-4 py-3 w-64">Specialisation</th>
      <th className="px-4 py-3 w-20">Age</th>
      <th className="px-4 py-3 w-64">Date & Time</th>
      <th className="px-4 py-3 w-40">Status</th>
    </tr>
  </thead>
  <tbody>
    {currentAppointments.map((appointment) => (
      <tr key={appointment._id} className="border-b border-gray-200 hover:bg-gray-50 align-top">
        <td className="px-4 py-4 font-medium text-gray-700 whitespace-nowrap">
          #{appointment._id.slice(14)}
        </td>

        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <Image
              src={appointment.patientId.profileImage || '/patient-placeholder.jpg'}
              alt={appointment.patientId.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{appointment.patientId.name}</p>
              <p className="text-sm text-gray-500">{appointment.patientId.phone}</p>
            </div>
          </div>
        </td>

        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <Image
              src={appointment.doctorId.profileImg || '/patient-placeholder.jpg'}
              alt={appointment.doctorId.fullName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{appointment.doctorId.fullName}</p>
              <p className="text-sm text-gray-500">{appointment.doctorId.email}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">{appointment.doctorId.specialization}</td>

        <td className="px-4 py-4 whitespace-nowrap">{appointment.patientId.age}</td>

        <td className="px-4 py-4 whitespace-nowrap">
          {new Date(appointment.date).toLocaleDateString()} | {appointment.startTime} - {appointment.endTime}
        </td>

        <td className="px-4 py-4 whitespace-nowrap">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            appointment.paymentStatus === 'paid'
              ? 'bg-green-100 text-green-800'
              : appointment.paymentStatus === 'unpaid'
              ? 'bg-red-100 text-red-800'
              : appointment.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : appointment.status === 'cancelled'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
          {appointment.paymentStatus}
          </span>
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

    </div>
  );
}

export default DoctorAppointment;
