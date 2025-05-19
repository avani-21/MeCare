"use client";
import { useState } from 'react';
import { RRule } from 'rrule';
import { format, addMinutes, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface RecurringSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    weekdays?: number[];
  }) => void;
  initialStartTime: string;
  initialDuration: number;
}

const weekdaysOptions = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export default function RecurringSlotModal({
  isOpen,
  onClose,
  onSubmit,
  initialStartTime,
  initialDuration,
}: RecurringSlotModalProps) {
  // Create dates without timezone offset issues
  const createLocalDate = (date?: Date) => {
    const d = date ? new Date(date) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const [startDate, setStartDate] = useState<Date>(createLocalDate());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = createLocalDate();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [interval, setInterval] = useState(1);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [duration, setDuration] = useState(initialDuration);
  
  // Calculate end time based on start time and duration
  const endTime = (() => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);
    const end = addMinutes(start, duration);
    return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
  })();

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Create dates with proper time handling
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset time components to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
      toast.error('End date must be after start date');
      return;
    }

    if (frequency === 'WEEKLY' && selectedWeekdays.length === 0) {
      toast.error('Please select at least one weekday for weekly recurrence');
      return;
    }

    onSubmit({
      startDate: start,
      endDate: end,
      startTime,
      endTime,
      frequency,
      interval,
      weekdays: frequency === 'WEEKLY' ? selectedWeekdays : undefined,
    });
    onClose();
  };

  const handleWeekdayToggle = (weekday: number) => {
    if (selectedWeekdays.includes(weekday)) {
      setSelectedWeekdays(selectedWeekdays.filter(w => w !== weekday));
    } else {
      setSelectedWeekdays([...selectedWeekdays, weekday]);
    }
  };

  const generatePreview = () => {
    try {
      let freq;
      switch (frequency) {
        case 'DAILY':
          freq = RRule.DAILY;
          break;
        case 'WEEKLY':
          freq = RRule.WEEKLY;
          break;
        case 'MONTHLY':
          freq = RRule.MONTHLY;
          break;
        default:
          freq = RRule.WEEKLY;
      }

      // Create a date without timezone issues for RRule
      const createRuleDate = (date: Date) => {
        const d = new Date(date);
        d.setHours(12, 0, 0, 0); // Set to noon to avoid DST issues
        return d;
      };

      const rule = new RRule({
        freq,
        dtstart: createRuleDate(startDate),
        until: createRuleDate(endDate),
        interval,
        byweekday: frequency === 'WEEKLY' ? selectedWeekdays.map(day => {
          switch (day) {
            case 0: return RRule.SU;
            case 1: return RRule.MO;
            case 2: return RRule.TU;
            case 3: return RRule.WE;
            case 4: return RRule.TH;
            case 5: return RRule.FR;
            case 6: return RRule.SA;
            default: return RRule.MO;
          }
        }) : undefined,
      });

      const dates = rule.all().slice(0, 5);
      return dates.map(date => format(date, 'EEE, MMM d, yyyy')).join(', ') + (rule.all().length > 5 ? '...' : '');
    } catch (error) {
      console.error('Error generating preview:', error);
      return 'Invalid recurrence rule';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Create Recurring Slots</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={(e) => setStartDate(createLocalDate(new Date(e.target.value)))}
                className="w-full p-2 border rounded"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={(e) => setEndDate(createLocalDate(new Date(e.target.value)))}
                className="w-full p-2 border rounded"
                min={format(startDate, 'yyyy-MM-dd')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="15"
                step="15"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="p-2 bg-gray-100 rounded">
              <p className="text-sm">
                <span className="font-medium">Calculated End Time:</span> {endTime}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Recurrence Pattern</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY')}
                className="w-full p-2 border rounded"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            {frequency === 'WEEKLY' && (
              <div>
                <label className="block text-sm font-medium mb-1">Weekdays</label>
                <div className="flex flex-wrap gap-2">
                  {weekdaysOptions.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleWeekdayToggle(day.value)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedWeekdays.includes(day.value)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Repeat Every</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={interval}
                  onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                  className="w-16 p-2 border rounded"
                />
                <span>{frequency === 'DAILY' ? 'day(s)' : frequency === 'WEEKLY' ? 'week(s)' : 'month(s)'}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-100 rounded">
              <p className="text-sm font-medium">Preview:</p>
              <p className="text-sm">{generatePreview()}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Create Slots
          </button>
        </div>
      </div>
    </div>
  );
}