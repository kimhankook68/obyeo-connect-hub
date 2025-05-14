
import React, { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { isSameDay, parseISO, format, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Badge } from "@/components/ui/badge";
import EventPopover from "./EventPopover";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  events: CalendarEvent[];
  getEventCountForDay: (day: Date) => number;
  handleEdit: (event: CalendarEvent) => void;
  handleDelete: (event: CalendarEvent) => void;
  formatEventDate: (dateString: string) => string;
  isUserLoggedIn: boolean;
}

const MonthView: React.FC<MonthViewProps> = ({
  date,
  setDate,
  events,
  getEventCountForDay,
  handleEdit,
  handleDelete,
  formatEventDate,
  isUserLoggedIn
}) => {
  // 현재 달력에 표시되는 월
  const [currentMonth, setCurrentMonth] = useState<Date>(date || new Date());
  
  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

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
      <div className="flex justify-between items-center mb-2 px-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={goToPreviousMonth} 
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-medium">
          {format(currentMonth, "yyyy년 MM월", { locale: ko })}
        </h2>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={goToNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
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
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="w-full h-full rounded-md border-0"
          locale={ko}
          hideHead={true}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full h-full",
            month: "w-full h-full",
            row: "flex w-full flex-1 h-[calc(100%/6)]",
            day: "h-full text-center p-1 relative border border-gray-100 hover:bg-blue-50 transition-colors duration-200",
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
              const isCurrentMonth = displayMonth;
              
              // 해당 날짜의 이벤트 필터링
              const dayEvents = events.filter(event => {
                const eventDate = parseISO(event.start_time);
                return isSameDay(eventDate, date) && isCurrentMonth;
              });

              const DayContents = (
                <div className="h-full w-full flex flex-col">
                  <div className={`${
                    date.getDay() === 0 ? 'text-red-500' : 
                    date.getDay() === 6 ? 'text-blue-500' : ''
                  } ${isCurrentMonth ? '' : 'text-gray-300'} font-medium text-sm sm:text-base w-full text-center`}>
                    {dayNum}
                  </div>
                  
                  {dayEvents.slice(0, 2).map((event, idx) => (
                    <div 
                      key={event.id}
                      className="mt-1 truncate text-xs"
                      style={{
                        color: event.type === 'meeting' ? '#dc3545' : 
                          event.type === 'training' ? '#0dcaf0' : 
                          event.type === 'event' ? '#822409' : 
                          event.type === 'volunteer' ? '#198754' : '#6c757d'
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-primary mt-1">+ {dayEvents.length - 2}개 더보기</div>
                  )}
                </div>
              );
              
              return dayEvents.length > 0 ? (
                <EventPopover
                  date={date}
                  events={dayEvents}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  formatEventDate={formatEventDate}
                  isUserLoggedIn={isUserLoggedIn}
                >
                  {DayContents}
                </EventPopover>
              ) : DayContents;
            }
          }}
        />
      </div>
    </div>
  );
};

export default MonthView;
