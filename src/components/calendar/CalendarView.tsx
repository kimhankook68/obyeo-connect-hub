
import React, { useMemo } from "react";
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO, startOfDay } from "date-fns";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import { CalendarEvent } from "@/hooks/useCalendarEvents";

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
  viewMode
}) => {
  // 해당 날짜의 이벤트 필터링
  const filteredEvents = useMemo(() => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = parseISO(event.start_time);
      return isSameDay(eventDate, date);
    });
  }, [date, events]);
  
  // 주간 날짜 계산
  const weekDates = useMemo(() => {
    if (!date) return [];
    
    const start = startOfWeek(date, { weekStartsOn: 0 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [date]);
  
  // 해당 날짜의 이벤트 개수 반환
  const getEventCountForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start_time);
      return isSameDay(eventDate, day);
    }).length;
  };

  return (
    <div className="flex-1 overflow-auto">
      {viewMode === "month" && (
        <MonthView 
          date={date} 
          setDate={setDate} 
          events={events} 
          getEventCountForDay={getEventCountForDay}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          formatEventDate={formatEventDate}
          isUserLoggedIn={isUserLoggedIn}
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
  );
};

export default CalendarView;
