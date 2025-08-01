import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  date: string;
  categories: string[];
  duration: number;
  completed: boolean;
}

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  color: string;
  type: 'meeting' | 'call' | 'event';
}

interface TaskCalendarProps {
  view: 'monthly' | 'weekly';
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  tasks: Task[];
}

const TaskCalendar = ({ view, selectedDate, onDateSelect, tasks }: TaskCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dummy meetings for demonstration
  const dummyMeetings: Meeting[] = [
    {
      id: '1',
      title: 'Morning Standup',
      startTime: '09:00',
      endTime: '09:30',
      date: '2025-07-28',
      color: 'bg-blue-500',
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Product Review',
      startTime: '10:00',
      endTime: '11:00',
      date: '2025-07-28',
      color: 'bg-green-500',
      type: 'meeting'
    },
    {
      id: '3',
      title: 'Client Call',
      startTime: '14:00',
      endTime: '15:00',
      date: '2025-07-28',
      color: 'bg-purple-500',
      type: 'call'
    },
    {
      id: '4',
      title: 'Team Building',
      startTime: '11:00',
      endTime: '12:00',
      date: '2025-07-29',
      color: 'bg-orange-500',
      type: 'event'
    },
    {
      id: '5',
      title: 'Sprint Planning',
      startTime: '09:30',
      endTime: '11:00',
      date: '2025-07-30',
      color: 'bg-blue-500',
      type: 'meeting'
    },
    {
      id: '6',
      title: 'Design Review',
      startTime: '15:00',
      endTime: '16:00',
      date: '2025-07-30',
      color: 'bg-green-500',
      type: 'meeting'
    },
    {
      id: '7',
      title: 'Lunch Meeting',
      startTime: '12:30',
      endTime: '13:30',
      date: '2025-07-31',
      color: 'bg-yellow-500',
      type: 'meeting'
    }
  ];

  // Club every 4 hours into one block
  const timeSlots = [
    '09:00', '13:00', '17:00'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => task.date === formatDateKey(date));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getMeetingsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return dummyMeetings.filter(meeting => meeting.date === dateKey);
  };

  const getMeetingForTimeSlot = (date: Date, timeSlot: string) => {
    const meetings = getMeetingsForDate(date);
    return meetings.find(meeting => 
      meeting.startTime <= timeSlot && meeting.endTime > timeSlot
    );
  };

  const getMeetingsForTimeSlotBlock = (date: Date, timeSlot: string) => {
    const meetings = getMeetingsForDate(date);
    // Get start and end of the block
    const [startHour, startMin] = timeSlot.split(':').map(Number);
    const blockStart = startHour * 60 + startMin;
    const blockEnd = blockStart + 240; // 4 hours
    return meetings.filter(meeting => {
      const [mStartHour, mStartMin] = meeting.startTime.split(':').map(Number);
      const [mEndHour, mEndMin] = meeting.endTime.split(':').map(Number);
      const mStart = mStartHour * 60 + mStartMin;
      const mEnd = mEndHour * 60 + mEndMin;
      // Overlaps with block
      return mStart < blockEnd && mEnd > blockStart;
    });
  };

  const getTimeSlotPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 9 * 60; // 9:00 AM
    return ((totalMinutes - startMinutes) / 30); // 30-minute slots
  };

  const getMeetingHeight = (meeting: Meeting) => {
    const startPos = getTimeSlotPosition(meeting.startTime);
    const endPos = getTimeSlotPosition(meeting.endTime);
    return endPos - startPos;
  };

  if (view === 'weekly') {
    const weekDays = getWeekDays(currentDate);
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];

    return (
      <div className="bg-white rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
        <div className="bg-white border-b border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Weekly Calendar</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {weekStart.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })} - {weekEnd.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
                className="bg-white shadow-md hover:shadow-lg border border-border/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
                className="bg-white shadow-md hover:shadow-lg border border-border/50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-8 gap-0 border border-border/30 rounded-lg overflow-hidden bg-white">
            {/* Time column header */}
            <div className="bg-white border-r border-border/30 p-3">
              <div className="text-sm font-medium text-muted-foreground">Time</div>
            </div>
            
            {/* Day headers */}
            {weekDays.map((date, index) => (
              <div key={index} className="bg-white border-r border-border/30 last:border-r-0 p-3">
                <div className="text-center">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={cn(
                    "text-lg font-semibold mt-1",
                    isToday(date) ? "text-primary" : "text-foreground",
                    isSelected(date) && "text-primary"
                  )}>
                    {date.getDate()}
                  </div>
                </div>
              </div>
            ))}

            {/* Time slots and meetings */}
            {timeSlots.map((timeSlot, slotIndex) => (
              <div key={timeSlot} className="contents">
                {/* Time label */}
                <div className="bg-white border-r border-border/30 border-t border-border/30 p-3 text-right">
                  <div className="text-sm font-medium text-muted-foreground">
                    {timeSlot} - {(() => {
                      const [h, m] = timeSlot.split(':').map(Number);
                      const end = h + 4;
                      return `${end.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    })()}
                  </div>
                </div>
                
                {/* Day columns */}
                {weekDays.map((date, dayIndex) => {
                  const meetings = getMeetingsForTimeSlotBlock(date, timeSlot);
                  return (
                    <div 
                      key={`${timeSlot}-${dayIndex}`}
                      className={cn(
                        "border-r border-t border-border/30 last:border-r-0 p-2 min-h-[80px] relative",
                        "hover:bg-accent/5 transition-colors cursor-pointer",
                        isSelected(date) && "bg-primary/5"
                      )}
                      onClick={() => onDateSelect(date)}
                    >
                      {/* Render all meetings in this block with uniform white styling */}
                      {meetings.map(meeting => (
                        <div 
                          key={meeting.id}
                          className={cn(
                            "bg-white border border-gray-200 rounded-lg p-2 text-xs font-medium shadow-sm mb-1",
                            "hover:shadow-md transition-all duration-200 cursor-pointer",
                            "hover:scale-105 hover:border-primary/30"
                          )}
                          title={`${meeting.title} (${meeting.startTime} - ${meeting.endTime})`}
                        >
                          <div className="font-semibold truncate text-gray-800">{meeting.title}</div>
                          <div className="text-gray-500 text-xs mt-1">
                            {meeting.startTime} - {meeting.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300"></div>
              <span className="text-sm text-muted-foreground">Meetings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300"></div>
              <span className="text-sm text-muted-foreground">Calls</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300"></div>
              <span className="text-sm text-muted-foreground">Events</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Monthly view
  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
      <div className="bg-white border-b border-border/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Monthly Calendar</h3>
            <p className="text-sm text-muted-foreground mt-1">{monthName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="bg-white shadow-md hover:shadow-lg border border-border/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="bg-white shadow-md hover:shadow-lg border border-border/50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-3 bg-white rounded-lg">
              {day}
            </div>
          ))}
          
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="p-2" />;
            }

            const dayTasks = getTasksForDate(date);
            const completedCount = dayTasks.filter(t => t.completed).length;
            const incompleteCount = dayTasks.length - completedCount;
            return (
              <div
                key={index}
                className={cn(
                  "min-h-20 p-3 border border-blue-100/60 rounded-xl cursor-pointer transition-all shadow-lg bg-gradient-to-br from-white/60 to-blue-100/40 hover:scale-105 hover:shadow-2xl",
                  isSelected(date) && "border-primary bg-primary/10",
                  isToday(date) && "bg-primary/20 border-primary"
                )}
                onClick={() => onDateSelect(date)}
              >
                <div className="text-center mb-2">
                  <span className={cn(
                    "text-sm font-semibold",
                    isToday(date) ? "text-primary" : "text-foreground"
                  )}>
                    {date.getDate()}
                  </span>
                </div>
                <div className="flex justify-center gap-1">
                  {Array.from({ length: incompleteCount }).map((_, i) => (
                    <span
                      key={`incomplete-${i}`}
                      className="inline-block w-2 h-2 rounded-full bg-destructive"
                    />
                  ))}
                  {Array.from({ length: completedCount }).map((_, i) => (
                    <span
                      key={`complete-${i}`}
                      className="inline-block w-2 h-2 rounded-full bg-success"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskCalendar;