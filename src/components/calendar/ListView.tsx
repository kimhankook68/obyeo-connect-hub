
import React from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import EventItem from "./EventItem";

interface ListViewProps {
  events: CalendarEvent[];
  loading: boolean;
  handleEdit: (event: CalendarEvent) => void;
  handleDelete: (event: CalendarEvent) => void;
  formatEventDate: (dateString: string) => string;
  isUserLoggedIn: boolean;
}

const ListView: React.FC<ListViewProps> = ({
  events,
  loading,
  handleEdit,
  handleDelete,
  formatEventDate,
  isUserLoggedIn,
}) => {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          등록된 일정이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
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

export default ListView;
