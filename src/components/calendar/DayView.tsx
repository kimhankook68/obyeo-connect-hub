
import React from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import EventsGrid from "./EventsGrid";
import { Skeleton } from "@/components/ui/skeleton";

interface DayViewProps {
  date: Date | undefined;
  loading: boolean;
  filteredEvents: CalendarEvent[];
  handleEdit: (event: CalendarEvent) => void;
  handleDelete: (event: CalendarEvent) => void;
  isUserLoggedIn: boolean;
}

const DayView: React.FC<DayViewProps> = ({
  date,
  loading,
  filteredEvents,
  handleEdit,
  handleDelete,
  isUserLoggedIn,
}) => {
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-[30px] w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[150px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="bg-muted/20 p-4 rounded-md mb-4">
        <h2 className="text-xl font-semibold text-center">
          {date ? format(date, "yyyy년 MM월 dd일 (EEEE)", { locale: ko }) : "일정 보기"}
        </h2>
      </div>
      
      <EventsGrid 
        events={filteredEvents} 
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        formatEventDate={(date) => format(parseISO(date), "HH:mm", { locale: ko })}
        isUserLoggedIn={isUserLoggedIn}
        selectedDate={date}
      />
    </div>
  );
};

export default DayView;
