"use client"
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DoctorDashboardData } from '@/type/doctor';
import Image from 'next/image';
import { IAppointment } from '@/type/patient';
import { useParams, useRouter } from 'next/navigation';
import { getDashboard } from '@/lib/api/doctor/doctor';

function DoctorDashboard() {
  const [data, setData] = useState<DoctorDashboardData | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const param=useParams()
  const id=param.id as string

  let doctor=localStorage.getItem("doctorId")

  const getDashboardData = async (doctorId:string) => {
    try {
      setLoading(true);
      setData(null)
      setTodayAppointments([])
      const response = await getDashboard(doctorId);
      if (response) {
        setData(response.summary);
        setTodayAppointments(response.todaysAppointment || []);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error loading doctor dashboard data:', error);
      toast.error('Failed to load doctor dashboard');
    } finally {
      setLoading(false);
    }
  };


 useEffect(() => {
    if (id) {
      getDashboardData(id);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Doctor Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Appointments</p>
              <h3 className="text-2xl font-bold text-gray-800">{data.totalAppointment}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Consulted Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Consulted</p>
              <h3 className="text-2xl font-bold text-gray-800">{data.consultedAppointment}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Upcoming appointments</p>
              <h3 className="text-2xl font-bold text-gray-800">{data.todaysAppointmentCount}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments Table */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => router.push(`/doctor/${id}/appointment`)}
          >
            View All
          </button>
        </div>
        
        {todayAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Image 
                            className="h-10 w-10 rounded-full" 
                            src={appointment.patientId?.profileImage || '/default-avatar.png'} 
                            alt={appointment.patientId?.name || 'Patient'}
                            width={40}
                            height={40}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patientId?.name || 'Unknown Patient'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patientId?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                      <div className="text-sm text-gray-900">{new Date(appointment.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{appointment.startTime} to {appointment.endTime}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.doctorId?.specialization || 'General Consultation'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'booked' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No appointments scheduled for today</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;