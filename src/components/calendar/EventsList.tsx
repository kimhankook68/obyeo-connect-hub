
import React from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import EventItem from "./EventItem";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface EventsListProps {
  date: Date | undefined;
  loading: boolean;
  filteredEvents: CalendarEvent[];
  handleEdit: (event: CalendarEvent) => void;
  handleDelete: (event: CalendarEvent) => void;
  formatEventDate: (dateString: string) => string;
  isUserLoggedIn: boolean;
}

const EventsList: React.FC<EventsListProps> = ({
  date,
  loading,
  filteredEvents,
  handleEdit,
  handleDelete,
  formatEventDate,
  isUserLoggedIn,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <div className="w-1 h-5 bg-primary mr-2"></div>
        {date ? format(date, "yyyy년 MM월 dd일", { locale: ko }) : "전체"} 일정
      </h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          해당 날짜에 등록된 일정이 없습니다.
        </div>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {filteredEvents.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              onEdit={handleEdit}
              onDelete={handleDelete}
              formatEventDate={formatEventDate}
              isUserLoggedIn={isUserLoggedIn}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;
