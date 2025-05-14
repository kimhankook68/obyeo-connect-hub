
import React, { useMemo } from "react";
import { format, isSameDay, parseISO, addMonths, subMonths, isEqual, startOfWeek, endOfWeek, eachDayOfInterval, addDays, addWeeks } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import EventsList from "./EventsList";

interface CalendarViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  events: CalendarEvent[];
  loading: boolean;
  handleEdit: (event: CalendarEvent) => void;
  handleDelete: (event: CalendarEvent) => void;
  formatEventDate: (dateString: string) => string;
  isUserLoggedIn: boolean;
  viewMode: "month" | "week" | "day";
}

const CalendarView: React.FC<CalendarViewProps> = ({
  date,
  setDate,
  events,
  loading,
  handleEdit,
  handleDelete,
  formatEventDate,
  isUserLoggedIn,
  viewMode,
}) => {
  // 날짜에 따른 이벤트 필터링
  const getFilteredEvents = () => {
    if (!date) return events;
    
    return events.filter((event) => {
      const eventStartDate = parseISO(event.start_time);
      
      if (viewMode === "day") {
        // 일간 보기: 선택한 날짜와 같은 일정만
        return isSameDay(eventStartDate, date);
      } else if (viewMode === "week") {
        // 주간 보기: 선택한 날짜가 포함된 주의 일정
        const weekStart = startOfWeek(date, { locale: ko });
        const weekEnd = endOfWeek(date, { locale: ko });
        return eventStartDate >= weekStart && eventStartDate <= weekEnd;
      } else {
        // 월간 보기: 선택한 날짜와 같은 일정만 (기본)
        return isSameDay(eventStartDate, date);
      }
    });
  };

  const filteredEvents = getFilteredEvents();
  
  // 현재 달과 다음, 이전 달로 이동하는 함수
  const goToPreviousMonth = () => {
    if (date) {
      const newDate = viewMode === "day" ? addDays(date, -1) : 
                      viewMode === "week" ? addWeeks(date, -1) : 
                      subMonths(date, 1);
      setDate(newDate);
    }
  };

  const goToNextMonth = () => {
    if (date) {
      const newDate = viewMode === "day" ? addDays(date, 1) : 
                      viewMode === "week" ? addWeeks(date, 1) : 
                      addMonths(date, 1);
      setDate(newDate);
    }
  };

  // 특정 날짜의 이벤트 개수를 가져오는 함수
  const getEventCountForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStartDate = parseISO(event.start_time);
      return isSameDay(eventStartDate, day);
    }).length;
  };

  // 주간 보기에 사용할 날짜 배열
  const weekDates = useMemo(() => {
    if (!date) return [];
    const start = startOfWeek(date, { locale: ko });
    const end = endOfWeek(date, { locale: ko });
    return eachDayOfInterval({ start, end });
  }, [date]);

  // 뷰 모드에 따른 제목 포맷
  const getViewTitleFormat = () => {
    if (!date) return "";
    
    if (viewMode === "day") {
      return format(date, "yyyy년 MM월 dd일", { locale: ko });
    } else if (viewMode === "week") {
      const start = startOfWeek(date, { locale: ko });
      const end = endOfWeek(date, { locale: ko });
      return `${format(start, "yyyy년 MM월 dd일", { locale: ko })} ~ ${format(end, "MM월 dd일", { locale: ko })}`;
    } else {
      return format(date, "yyyy년 MM월", { locale: ko });
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-white p-4 rounded-lg border w-full flex-1 flex flex-col">
        <div className="w-full flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium">
              {getViewTitleFormat()}
            </h2>
            <Button variant="outline" size="icon" onClick={goToNextMonth} className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {viewMode === "month" && (
            <MonthView
              date={date}
              setDate={setDate}
              events={events}
              getEventCountForDay={getEventCountForDay}
            />
          )}
          
          {viewMode === "week" && (
            <WeekView
              date={date}
              setDate={setDate}
              events={events}
              weekDates={weekDates}
            />
          )}
          
          {viewMode === "day" && (
            <DayView
              date={date}
              loading={loading}
              filteredEvents={filteredEvents}
            />
          )}
        </div>
      </div>
      
      <EventsList
        date={date}
        loading={loading}
        filteredEvents={filteredEvents}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        formatEventDate={formatEventDate}
        isUserLoggedIn={isUserLoggedIn}
      />
    </div>
  );
};

export default CalendarView;
