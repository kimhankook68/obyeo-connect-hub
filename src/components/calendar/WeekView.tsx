
import React from "react";
import { isSameDay, parseISO, format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";

interface WeekViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  events: CalendarEvent[];
  weekDates: Date[];
}

const WeekView: React.FC<WeekViewProps> = ({
  date,
  setDate,
  events,
  weekDates,
}) => {
  return (
    <div className="border rounded-md w-full h-full flex-1 flex flex-col min-h-[500px]">
      <div className="grid grid-cols-7 text-center bg-gray-50 py-2 border-b">
        {weekDates.map((weekDay, idx) => (
          <div 
            key={idx}
            className={`${
              weekDay.getDay() === 0 ? 'text-red-500' : 
              weekDay.getDay() === 6 ? 'text-blue-500' : ''
            } font-medium`}
          >
            {format(weekDay, "EEE", { locale: ko })}
            <div className="mt-1">{format(weekDay, "d", { locale: ko })}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 flex-1 min-h-[300px]">
        {weekDates.map((day, idx) => {
          const dayEvents = events.filter(event => {
            const eventDate = parseISO(event.start_time);
            return isSameDay(eventDate, day);
          });
          
          return (
            <div 
              key={idx} 
              className={`border-r h-full p-1 overflow-y-auto ${
                isSameDay(day, new Date()) ? 'bg-blue-50' : ''
              } ${isSameDay(day, date || new Date()) ? 'bg-primary/5' : ''}`}
              onClick={() => setDate(day)}
            >
              {dayEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="mb-1 text-xs bg-red-500 text-white p-1 rounded truncate" 
                  style={{
                    backgroundColor: event.type === 'meeting' ? '#dc3545' : 
                      event.type === 'training' ? '#0dcaf0' : 
                      event.type === 'event' ? '#ffc107' : 
                      event.type === 'volunteer' ? '#198754' : '#dc3545'
                  }}
                >
                  {format(parseISO(event.start_time), "HH:mm")} {event.title}
                </div>
              ))}
              {dayEvents.length === 0 && (
                <div className="text-center text-xs text-gray-400 mt-2">일정 없음</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
