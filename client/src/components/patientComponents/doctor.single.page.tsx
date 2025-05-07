"use client";

import { useEffect, useState } from 'react';
import { FaStar, FaRegClock, FaPhone, FaEnvelope, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getSingleDoctor, getSlots } from '@/lib/api/patient/doctors';
import { toast } from 'sonner';
import { IDoctor } from '@/type/patient';
import { ISlot } from '@/type/patient';
import { appointmentBook } from '@/lib/api/patient/patient';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import DoctorReviews from './review';

interface Params {
  id: string;
}

const DoctorProfile = ({ params }: { params: Params }) => {
  const [doctorData, setDoctorData] = useState<IDoctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const router = useRouter();

  const fetchDoctor = async () => {
    try {
      const result = await getSingleDoctor(params.id);
      if (result.data.success) {
        setDoctorData(result.data.data);
        toast.success("Doctor data loaded successfully");
      } else {
        toast.error("Failed to load doctor data");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching doctor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [params.id]);

  const handleSlotClick = async () => {
    try {
      const response = await getSlots(params.id);
      if (response?.data?.data) {
        const slotsData = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data];
  
        setSlots(slotsData);
        
        const dates = [...new Set(slotsData.map((slot: any) => {
          const date = new Date(slot.date);
          // Manually format in YYYY-MM-DD (UTC)
          return [
            date.getUTCFullYear(),
            String(date.getUTCMonth() + 1).padStart(2, '0'),
            String(date.getUTCDate()).padStart(2, '0'),
          ].join('-');
        }))];
        setAvailableDates(dates);
        
        
      
        setSlotModalVisible(true);
      }
    } catch (error: any) {
      console.error(error.message);
      toast.error("No slot available");
    }
  };
  
  const handleAppointmentConfirmation = async (slot: ISlot) => {
    try {
      const appointmentData = {
        doctorId: doctorData?._id,
        slotId: slot._id,
        date: new Date(slot.date),
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: "pending" as "pending",
        paymentStatus: "unpaid" as "unpaid",
        amount: 120,
      };

      const response = await appointmentBook(appointmentData);
      console.log("appointment", response?.data.data._id);
      localStorage.setItem("AppointmentId", response?.data.data._id);
      if (response?.data?.success) {
        setSlotModalVisible(false);
        await handleSlotClick();
        router.push("/appointment_booking");
      } else {
        toast.error("Failed to book slot");
      }
    } catch (error: any) {
      console.error(error.message);
      toast.error("An error occurred while booking the appointment");
    }
  };

  const handleAppointmentClick = async (slot: ISlot) => {
    Swal.fire({
      title: 'Confirm Appointment?',
      text: `You are about to book an appointment on ${new Date(slot.date).toLocaleDateString()} at ${slot.startTime} - ${slot.endTime}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, book it!',
      cancelButtonText: 'No, close',
    }).then((result) => {
      if (result.isConfirmed) {
        handleAppointmentConfirmation(slot);
      }
    });
  };

  // Calendar functions
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and total days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get days from previous month
    const daysFromPrevMonth = firstDay;
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    // Get days from next month
    const totalDaysToShow = Math.ceil((daysInMonth + firstDay) / 7) * 7;
    const daysFromNextMonth = totalDaysToShow - (daysInMonth + firstDay);
    
    const days = [];
    
    // Previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(year, month - 1, day);
      days.push({
        day,
        date,
        isCurrentMonth: false,
        isAvailable: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        day: i,
        date,
        isCurrentMonth: true,
        isAvailable: availableDates.includes(dateStr)
      });
    }
    
    // Next month days
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        day: i,
        date,
        isCurrentMonth: false,
        isAvailable: false
      });
    }
    
    return days;
  };

  // Filter slots by selected date
  const filteredSlots = selectedDate 
    ? slots.filter(slot => 
        new Date(slot.date).toISOString().split('T')[0] === selectedDate
      )
    : [];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p>Loading doctor profile...</p>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p>Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Doctor Image */}
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-200 overflow-hidden">
          <img
            src={doctorData.profileImg || "/doctor-placeholder.jpg"}
            alt={doctorData.fullName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Doctor Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{doctorData.fullName}</h1>
          <p className="text-gray-600">{doctorData.education}</p>
          <p className="text-gray-600">{doctorData.specialization}</p>
          <p className="text-gray-600">{doctorData.experience} years Experience</p>

          {/* Rating */}
          <div className="flex items-center mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`${i < Math.floor(doctorData.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="ml-2">{doctorData.rating > 0 ? doctorData.rating : 'No ratings yet'}</span>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">About</h2>
        <p className="text-gray-700">{doctorData.about}</p>
      </div>

      {/* Contact Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <FaEnvelope className="text-gray-500" />
          <span>Email: {doctorData.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaPhone className="text-gray-500" />
          <span>Phone: {doctorData.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaRegClock className="text-gray-500" />
          <span>Consulation fee: ₹{doctorData.consultantFee}</span>
        </div>
        <span>Appointment Booking fee: ₹120</span>
        <div className="flex items-center gap-2">
          <span>Location: {doctorData.street}, {doctorData.city}, {doctorData.state} - {doctorData.pincode}</span>
        </div>
      </div>

      <div className="mb-8">
        <button
          className="bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors"
          onClick={handleSlotClick}
        >
          Show Slot
        </button>
      </div>
<div>
  
<DoctorReviews doctorId={params.id} />
</div>

      {/* Slot Modal */}
      {slotModalVisible && (
        <div className="fixed inset-0  flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl flex flex-col md:flex-row w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Left Side - Time Slots */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Available Time Slots</h3>
                <button 
                  onClick={() => setSlotModalVisible(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              {selectedDate ? (
                <>
                  <p className="text-gray-600 mb-6">
                    Available slots 
                  </p>
                  
                  {filteredSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredSlots.map((slot) => (
                        <button
                          key={slot._id}
                          className={`p-3 rounded-lg border transition-all flex flex-col items-center ${
                            slot.isAvailable && !slot.isBooked
                              ? 'bg-teal-50 border-teal-200 hover:bg-teal-100 text-teal-800'
                              : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          onClick={() => slot.isAvailable && !slot.isBooked && handleAppointmentClick(slot)}
                          disabled={!slot.isAvailable || slot.isBooked}
                        >
                          <span className="font-medium text-sm">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          {slot.isBooked && (
                            <span className="text-xs text-red-500 mt-1">Booked</span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No available slots for the selected date
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a date to view available slots
                </div>
              )}
            </div>

            {/* Right Side - Calendar */}
            <div className="w-full md:w-80 border-l p-6 bg-gray-50">
              <h3 className="text-xl font-semibold mb-4">Select Date</h3>
              <div className="bg-white rounded-lg shadow-sm p-4">
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-4">
                  <button 
                    onClick={prevMonth}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="font-medium">
                    {currentMonth.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <button 
                    onClick={nextMonth}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <FaChevronRight />
                  </button>
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Dates */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarDays().map((dayObj, index) => {
                    const dateStr = dayObj.date.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    
                    return (
                      <button
                        key={index}
                        className={`h-8 w-8 rounded-full text-sm flex items-center justify-center ${
                          !dayObj.isCurrentMonth ? 'text-gray-300' : 
                          isSelected ? 'bg-teal-600 text-white' :
                          dayObj.isAvailable ? 'hover:bg-gray-100 text-gray-800' :
                          'text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!dayObj.isAvailable || !dayObj.isCurrentMonth}
                        onClick={() => {
                          if (dayObj.isAvailable && dayObj.isCurrentMonth) {
                            setSelectedDate(dateStr);
                          }
                        }}
                      >
                        {dayObj.day}
                      </button>
                    );
                  })}
                </div>
              </div>
              
        
              
              {/* Doctor Info */}
              <div className="mt-6">
                <h4 className="font-medium mb-2">Consultation Fee</h4>
                <p className="text-gray-700">₹{doctorData?.consultantFee}</p>
                <p className="text-sm text-gray-500 mt-4">
                  Note: An additional ₹120 booking fee will be charged
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;