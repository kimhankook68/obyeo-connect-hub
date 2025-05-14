
import React, { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { isSameDay, parseISO, format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Badge } from "@/components/ui/badge";

interface MonthViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  events: CalendarEvent[];
  getEventCountForDay: (day: Date) => number;
}

const MonthView: React.FC<MonthViewProps> = ({
  date,
  setDate,
  events,
  getEventCountForDay,
}) => {
  // 이벤트가 있는 날짜 계산
  const eventDates = useMemo(() => {
    return events.map(event => {
      const eventDate = parseISO(event.start_time);
      return new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate()
      );
    });
  }, [events]);

  return (
    <div className="flex-1 flex flex-col h-full min-h-[500px]">
      <div className="grid grid-cols-7 text-center border-b font-medium py-2">
        <div className="text-red-500">일</div>
        <div>월</div>
        <div>화</div>
        <div>수</div>
        <div>목</div>
        <div>금</div>
        <div className="text-blue-500">토</div>
      </div>
      
      <div className="flex-1 h-full">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full h-full rounded-md border-0"
          locale={ko}
          hideHead={true}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full h-full",
            month: "w-full h-full",
            row: "flex w-full flex-1 h-[calc(100%/6)]",
            day: "h-full text-left p-1 relative border border-gray-100 hover:bg-blue-50 transition-colors duration-200",
            day_today: "bg-blue-50 font-bold",
            day_selected: "bg-primary/10 text-primary font-bold",
            head_row: "hidden",
            head_cell: "hidden",
            caption_dropdowns: "hidden",
            nav: "hidden",
            caption: "hidden",
            table: "w-full h-full border-collapse"
          }}
          components={{
            DayContent: (props) => {
              const { date, displayMonth } = props;
              const dayNum = date.getDate();
              const eventCount = getEventCountForDay(date);
              const isCurrentMonth = displayMonth;
              
              return (
                <div className="h-full w-full flex flex-col">
                  <div className={`${
                    date.getDay() === 0 ? 'text-red-500' : 
                    date.getDay() === 6 ? 'text-blue-500' : ''
                  } ${isCurrentMonth ? '' : 'text-gray-300'} font-normal text-xs sm:text-sm`}>
                    {dayNum}
                  </div>
                  
                  {eventCount > 0 && isCurrentMonth && (
                    <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                      {eventCount > 0 && (
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(eventCount, 3) }).map((_, idx) => (
                            <Badge key={idx} variant="outline" className="h-1.5 w-1.5 p-0 rounded-full bg-primary border-0" />
                          ))}
                          {eventCount > 3 && (
                            <span className="text-xs text-gray-500">+{eventCount - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {events.filter(event => {
                    const eventDate = parseISO(event.start_time);
                    return isSameDay(eventDate, date) && isCurrentMonth;
                  }).map((event, idx) => (
                    idx < 1 ? (
                      <div 
                        key={event.id}
                        className="hidden sm:block absolute top-6 left-0 right-0 mx-1 h-5 overflow-hidden text-xs"
                      >
                        <div 
                          className="bg-red-500 text-white px-1 truncate rounded-sm text-xs"
                          style={{
                            backgroundColor: event.type === 'meeting' ? '#dc3545' : 
                            event.type === 'training' ? '#0dcaf0' : 
                            event.type === 'event' ? '#ffc107' : 
                            event.type === 'volunteer' ? '#198754' : '#dc3545'
                          }}
                        >
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              );
            }
          }}
        />
      </div>
    </div>
  );
};

export default MonthView;
