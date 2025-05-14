
import React from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";

interface DayViewProps {
  date: Date | undefined;
  loading: boolean;
  filteredEvents: CalendarEvent[];
}

const DayView: React.FC<DayViewProps> = ({
  date,
  loading,
  filteredEvents,
}) => {
  return (
    <div className="border rounded-md w-full h-full flex-1 flex flex-col min-h-[500px]">
      <div className="bg-gray-50 py-2 border-b text-center">
        <div className="font-medium">
          {date ? format(date, "yyyy년 MM월 dd일 EEEE", { locale: ko }) : ""}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <div 
                key={event.id}
                className="flex items-center space-x-2 p-3 rounded hover:bg-gray-50 border border-gray-100 shadow-sm"
              >
                <div 
                  className="w-3 h-10 rounded-l-md"
                  style={{
                    backgroundColor: event.type === 'meeting' ? '#dc3545' : 
                      event.type === 'training' ? '#0dcaf0' : 
                      event.type === 'event' ? '#ffc107' : 
                      event.type === 'volunteer' ? '#198754' : '#6c757d'
                  }}
                />
                <div>
                  <span className="font-medium">{format(parseISO(event.start_time), "HH:mm")} - </span>
                  <span>{event.title}</span>
                  <div className="text-sm text-gray-500">
                    {event.location && (
                      <span className="mr-2">📍 {event.location}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-lg">해당 날짜에 등록된 일정이 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
