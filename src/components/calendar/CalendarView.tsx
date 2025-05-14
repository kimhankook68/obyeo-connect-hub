
import React, { useMemo } from "react";
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO, startOfDay } from "date-fns";
import { ko } from "date-fns/locale";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import ListView from "./ListView";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Skeleton } from "@/components/ui/skeleton";

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
  getEventCountForDay: (day: Date) => number;
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
  getEventCountForDay
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

  if (loading) {
    return (
      <div className="w-full h-full space-y-4 p-4 flex flex-col">
        <Skeleton className="h-[50px] w-full" />
        <div className="grid grid-cols-7 gap-2 flex-grow">
          {Array(7).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto flex flex-col h-full">
      <div className="flex-grow h-full">
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
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            isUserLoggedIn={isUserLoggedIn}
          />
        )}
        
        {viewMode === "day" && (
          <DayView 
            date={date} 
            loading={loading} 
            filteredEvents={filteredEvents}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            isUserLoggedIn={isUserLoggedIn}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarView;
