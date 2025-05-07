"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { generateSlot, getSlot } from '@/lib/api/doctor/doctor';
import { Slot, SlotFormData } from '@/type/doctor';



const SimpleCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute]=useState('00');
  const [durationHours, setDurationHours] = useState('0');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [endTimeCalculated, setEndTimeCalculated] = useState('');
  const [createdSlots, setCreatedSlots] = useState<Slot[]>([]);
  const [isTodayOrFuture, setIsTodayOrFuture] = useState(true);
  const [slots, setSlots] = useState<Slot[] | null>([])

  useEffect(() => {
    const now = new Date();
    if (selectedDate) {
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      setIsTodayOrFuture(selected >= now);
    } else {
      setIsTodayOrFuture(true); // Initially true as no date is selected
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
    getSlots()
  }, [])


  const getSlots = async () => {
    try {
      let response = await getSlot()
      if (response) {
        setSlots(response)
      }
    } catch (error) {
      toast.error("Error ocuured while fetching slots")
    }
  }
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
    const daysNeeded = 42 - days.length; // 6 weeks
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
      console.log("slots", response)
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
        getSlots();
      }
    } catch (error) {
      toast.error('Error creating slots');
      console.error(error);
    }
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

  const groupedSlots = groupSlotsByDate(slots);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

        {/* Slot Creation Section */}
        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Create Time Slots</h2>

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

            <button
              onClick={handleCreateSlots}
              className="w-full bg-teal-800 text-white py-2 px-4 rounded hover:bg-teal-800 disabled:bg-teal-400"
              disabled={!selectedDate || !isTodayOrFuture}
            >
              Create Slots
            </button>
            {!isTodayOrFuture && selectedDate && (
              <p className="text-red-500 text-sm">Cannot create slots for past dates.</p>
            )}
          </div>


        </div>

      </div>
      {/* Created Slots Preview */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <h3 className="font-medium mb-4 text-xl">Available Slots</h3>
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
                    <div key={slot._id} className="p-2 border rounded flex justify-between bg-gray-50">
                      <span>
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                      <p className={`px-2 py-1 rounded text-xs ${slot.isBooked ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                        {slot.isBooked ? 'Booked' : 'Available'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleCalendar;
