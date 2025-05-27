"use client";
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { generateSlot, getSlot, editSlot, deleteSlot, generateRecurringSlots } from '@/lib/api/doctor/doctor';
import { Slot, SlotFormData } from '@/type/doctor';
import RecurringSlotModal from './recurring.slot.modal';
import { useParams } from 'next/navigation';
import { error } from 'console';

const SimpleCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [durationHours, setDurationHours] = useState('0');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [endTimeCalculated, setEndTimeCalculated] = useState('');
  const [createdSlots, setCreatedSlots] = useState<Slot[]>([]);
  const [isTodayOrFuture, setIsTodayOrFuture] = useState(true);
  const [slots, setSlots] = useState<Slot[] | null>([]);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSlots, setTotalSlots] = useState(0);
  const [slotsPerPage] = useState(10);
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const param = useParams();
  const id = param.id as string;

  useEffect(() => {
    const now = new Date();
    if (selectedDate) {
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      setIsTodayOrFuture(selected >= now);
    } else {
      setIsTodayOrFuture(true);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      const start = new Date(selectedDate);
      start.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);
      const totalDurationMinutes = parseInt(durationHours, 10) * 60 + parseInt(durationMinutes, 10);
      const end = new Date(start.getTime() + totalDurationMinutes * 60000);
      const endHour = String(end.getHours()).padStart(2, '0');
      const endMinute = String(end.getMinutes()).padStart(2, '0');
      setEndTimeCalculated(`${endHour}:${endMinute}`);
    } else {
      setEndTimeCalculated('');
    }
  }, [selectedDate, startHour, startMinute, durationHours, durationMinutes]);

  useEffect(() => {
    getSlots();
  }, [currentPage, startDateFilter, endDateFilter]);

  const getSlots = async (page: number = currentPage) => {
    setIsLoading(true);
    try {
    
      if (page === currentPage && (startDateFilter || endDateFilter)) {
        page = 1;
        setCurrentPage(1);
      }
      

      let response = await getSlot(
        id,
        page,
        slotsPerPage,
        startDateFilter ?? undefined,
        endDateFilter ?? undefined
      );
      if (response) {
        setSlots(response.slots || []);
        setTotalSlots(response.total || 0);
        setCurrentPage(page)
      }
    } catch (error) {
      toast.error("Error occurred while fetching slots");
    } finally {
      setIsLoading(false);
    }
  };

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const isDisabled = date < today;
      days.push(
        <div key={`prev-${i}`} className={`text-gray-400 p-2 ${isDisabled ? 'text-gray-300 cursor-not-allowed' : ''}`}>
          {prevMonthLastDay - i}
        </div>
      );
    }

    // Current month's days
    const now = new Date();
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isToday = now.toDateString() === date.toDateString();
      const isDisabled = date < today;

      days.push(
        <div
          key={`current-${i}`}
          className={`p-2 cursor-pointer ${isSelected ? 'bg-blue-500 text-white rounded-full' : isToday ? 'font-semibold' : 'hover:bg-gray-100'} ${isDisabled ? 'text-gray-300 cursor-not-allowed' : ''}`}
          onClick={() => !isDisabled && setSelectedDate(date)}
        >
          {i}
        </div>
      );
    }

    // Next month's days
    const daysNeeded = 42 - days.length;
    for (let i = 1; i <= daysNeeded; i++) {
      const date = new Date(year, month + 1, i);
      const isDisabled = date < today;
      days.push(
        <div key={`next-${i}`} className={`text-gray-400 p-2 ${isDisabled ? 'text-gray-300 cursor-not-allowed' : ''}`}>
          {i}
        </div>
      );
    }

    return days;
  };

  const handleCreateSlots = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    const now = new Date();
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    if (selected < now) {
      toast.error('Cannot create slots for past dates');
      return;
    }

    const startTime = `${startHour}:${startMinute}`;
    const endTime = endTimeCalculated;
    const duration = parseInt(durationHours, 10) * 60 + parseInt(durationMinutes, 10);

    try {
      const payload: SlotFormData = {
        date: selectedDate,
        startTime,
        endTime,
        duration,
      };

      const response = await generateSlot(payload);
      if (response) {
        toast.success(`SLOT CREATED SUCCESSFULLY`);
        const newSlot = {
          _id: response._id,
          date: new Date(response.date),
          startTime: response.startTime,
          endTime: response.endTime,
          duration,
          isBooked: response.isBooked,
        };

        setCreatedSlots([...createdSlots, newSlot]);
        getSlots(currentPage);
        resetForm();
      }else{
        toast.error("Slot alredy exist")
      }
      
    } catch (error) {
      toast.error('Error creating slots');
      console.error(error);
    }
  };

  const handleEditSlot = (slot: Slot) => {
    setEditingSlot(slot);
    setIsEditing(true);
    setSelectedDate(new Date(slot.date));
    
    const [startHour, startMinute] = slot.startTime.split(':');
    setStartHour(startHour);
    setStartMinute(startMinute);
    
    const [endHour, endMinute] = slot.endTime.split(':');
    const startDate = new Date(slot.date);
    startDate.setHours(parseInt(startHour), parseInt(startMinute));
    const endDate = new Date(slot.date);
    endDate.setHours(parseInt(endHour), parseInt(endMinute));
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);
    setDurationHours(Math.floor(durationMinutes / 60).toString());
    setDurationMinutes((durationMinutes % 60).toString());
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot || !selectedDate) {
      toast.error('Please select a date and slot to update');
      return;
    }

    const now = new Date();
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    if (selected < now) {
      toast.error('Cannot update slots for past dates');
      return;
    }

    const startTime = `${startHour}:${startMinute}`;
    const endTime = endTimeCalculated;
    const duration = parseInt(durationHours, 10) * 60 + parseInt(durationMinutes, 10);

    try {
      const payload: SlotFormData = {
        date: selectedDate,
        startTime,
        endTime,
        duration,
      };

      const response = await editSlot(editingSlot._id, payload);
      if (response) {
        toast.success(`SLOT UPDATED SUCCESSFULLY`);
        setIsEditing(false);
        setEditingSlot(null);
        getSlots();
        resetForm();
      }
      toast.error("Slot already exist")
    } catch (error) {
      toast.error('Error updating slot');
      console.error(error);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      try {
        const response = await deleteSlot(slotId);
        toast.success('Slot deleted successfully');
        getSlots();
      } catch (error) {
        toast.error('Error deleting slot');
        console.error(error);
      }
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingSlot(null);
    resetForm();
  };

  const resetForm = () => {
    setStartHour('09');
    setStartMinute('00');
    setDurationHours('0');
    setDurationMinutes('30');
    setSelectedDate(null);
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + increment,
      1
    ));
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours);
    return `${hourNum > 12 ? hourNum - 12 : hourNum}:${minutes} ${hourNum >= 12 ? 'PM' : 'AM'}`;
  };

  const groupSlotsByDate = (slotsArray: Slot[] | null) => {
    if (!slotsArray) return {};

    const groupedSlots: { [date: string]: Slot[] } = {};
    slotsArray.forEach(slot => {
      const slotDate = new Date(slot.date).toLocaleDateString();
      if (!groupedSlots[slotDate]) {
        groupedSlots[slotDate] = [];
      }
      groupedSlots[slotDate].push(slot);
    });
    return groupedSlots;
  };

  const handleCreateRecurringSlots = async (recurringData: {
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    weekdays?: number[];
  }) => {
    try {
      const response = await generateRecurringSlots({
        ...recurringData
      });
      
      if (response) {
        toast.success('Recurring slots created successfully');
        getSlots();
      }
      toast.error("Error creating slots")
    } catch (error:any) {
      toast.error(error.response?.data?.message);
      console.error(error);
    }
  };

  const groupedSlots = groupSlotsByDate(slots);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalPages = Math.ceil(totalSlots / slotsPerPage);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6 p-4">
        {/* Calendar Section */}
        <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              &lt;
            </button>
            <h2 className="font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="font-medium p-2">{day}</div>
            ))}
            {renderDays()}
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(null)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Slot Creation/Edit Section */}
        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? 'Edit Time Slot' : 'Create Time Slots'}
          </h2>

          {selectedDate && (
            <div className="mb-4 p-3 bg-teal-100 rounded">
              <p className="font-medium">
                Selected: {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <div className="flex gap-2">
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-1/2 p-2 border rounded"
                >
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((hour) => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                  className="w-1/2 p-2 border rounded"
                >
                  {['00', '15', '30', '45'].map((minute) => (
                    <option key={minute} value={minute}>{minute}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <div className="flex gap-2">
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-1/2 p-2 border rounded"
                >
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(1, '0')).map((hour) => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
                <span className="self-center">hours</span>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-1/2 p-2 border rounded"
                >
                  {['00', '15', '30', '45'].map((minute) => (
                    <option key={minute} value={minute}>{minute}</option>
                  ))}
                </select>
                <span className="self-center">minutes</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Time (Calculated)</label>
              <input
                type="text"
                value={endTimeCalculated}
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                readOnly
              />
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateSlot}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-400"
                  disabled={!selectedDate || !isTodayOrFuture}
                >
                  Update Slot
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleCreateSlots}
                  className="w-full bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 disabled:bg-teal-400"
                  disabled={!selectedDate || !isTodayOrFuture}
                >
                  Create Single Slot
                </button>
                <button
                  onClick={() => setIsRecurringModalOpen(true)}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-purple-400"
                  disabled={!selectedDate || !isTodayOrFuture}
                >
                  Create Recurring Slots
                </button>
              </div>
            )}
            {!isTodayOrFuture && selectedDate && (
              <p className="text-red-500 text-sm">Cannot {isEditing ? 'update' : 'create'} slots for past dates.</p>
            )}
          </div>
        </div>
        <RecurringSlotModal
          isOpen={isRecurringModalOpen}
          onClose={() => setIsRecurringModalOpen(false)}
          onSubmit={handleCreateRecurringSlots}
          initialStartTime={`${startHour}:${startMinute}`}
          initialDuration={parseInt(durationHours, 10) * 60 + parseInt(durationMinutes, 10)}
        />
      </div>

      {/* Created Slots Preview */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
    <h3 className="font-medium text-xl mb-2 md:mb-0">Available Slots</h3>
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">From</label>
        <input
          type="date"
          value={startDateFilter ? startDateFilter.toISOString().split('T')[0] : ''}
          onChange={(e) => setStartDateFilter(e.target.value ? new Date(e.target.value) : null)}
          min={new Date().toISOString().split('T')[0]} // Restrict to today or future
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">To</label>
        <input
          type="date"
          value={endDateFilter ? endDateFilter.toISOString().split('T')[0] : ''}
          onChange={(e) => setEndDateFilter(e.target.value ? new Date(e.target.value) : null)}
          min={new Date().toISOString().split('T')[0]} // Restrict to today or future
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="self-end">
        <button
          onClick={() => {
            setStartDateFilter(null);
            setEndDateFilter(null);
          }}
          className="px-3 py-2 text-white bg-teal-500 rounded hover:bg-gray-300 text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  </div>

        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedSlots)
              .filter(([date]) => {
                const slotDate = new Date(date);
                slotDate.setHours(0, 0, 0, 0);
                return slotDate >= today;
              })
              .map(([date, dailySlots]) => (
                <div key={date} className="border-b pb-4 last:border-0">
                  <h4 className="font-semibold text-lg mb-2">{date}</h4>
                  <div className="space-y-2">
                    {dailySlots.map(slot => (
                      <div key={slot._id} className="p-2 border rounded flex justify-between items-center bg-gray-50">
                        <span>
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                        <div className="flex items-center gap-2">
                          <p className={`px-2 py-1 rounded text-xs ${slot.isBooked ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                            {slot.isBooked ? 'Booked' : 'Available'}
                          </p>
                          {!slot.isBooked && (
                            <>
                              <button
                                onClick={() => handleEditSlot(slot)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Edit slot"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteSlot(slot._id)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Delete slot"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
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
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleCalendar;