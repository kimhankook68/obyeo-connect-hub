
import React, { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { isSameDay, parseISO, format, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [currentMonth, setCurrentMonth] = React.useState<Date>(date || new Date());
  
  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // 날짜 클릭 핸들러 - 선택된 날짜를 업데이트하여 일정 목록 표시
  const handleDateClick = (day: Date | undefined) => {
    console.log("Date clicked:", day);
    setDate(day);
  };

  // 이벤트 타입별 색상
  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case "meeting": return "bg-red-500 text-white";
      case "training": return "bg-blue-500 text-white";
      case "event": return "bg-amber-500 text-white";
      case "volunteer": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 p-2 bg-muted/10 rounded-lg">
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
      
      <div className="grid grid-cols-7 text-center border-b border-muted rounded-t-md bg-muted/10 font-medium py-2">
        <div className="text-red-500">일</div>
        <div>월</div>
        <div>화</div>
        <div>수</div>
        <div>목</div>
        <div>금</div>
        <div className="text-blue-500">토</div>
      </div>
      
      <div className="flex-1 h-full border rounded-b-md shadow-sm">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateClick}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="w-full h-full rounded-md border-0"
          locale={ko}
          hideHead={true}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full h-full",
            month: "w-full h-full",
            row: "flex w-full flex-1 h-[calc(100%/6)]",
            day: "h-full text-center p-1 relative border hover:bg-muted/10 transition-colors duration-200 cursor-pointer",
            day_today: "bg-primary/10 font-bold",
            day_selected: "bg-primary/20 text-primary font-bold",
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

              // 이벤트 일 시 배경색 강조
              const hasEvents = dayEvents.length > 0;

              return (
                <div className="h-full w-full flex flex-col" onClick={() => handleDateClick(date)}>
                  <div className={cn(
                    "flex justify-center",
                    date.getDay() === 0 ? 'text-red-500' : 
                    date.getDay() === 6 ? 'text-blue-500' : '',
                    isCurrentMonth ? '' : 'text-gray-300'
                  )}>
                    <span className={cn(
                      "flex items-center justify-center text-sm rounded-full w-7 h-7",
                      isSameDay(date, new Date()) && "bg-primary text-primary-foreground"
                    )}>
                      {dayNum}
                    </span>
                  </div>
                  
                  <div className="mt-1 flex-1">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div 
                        key={event.id}
                        className={cn(
                          "mb-0.5 truncate text-xs p-0.5 rounded",
                          getEventTypeColor(event.type)
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-primary font-medium text-center">
                        +{dayEvents.length - 3}개
                      </div>
                    )}
                  </div>
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
