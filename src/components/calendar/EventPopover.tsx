
import React from "react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import EventItem from "./EventItem";

interface EventPopoverProps {
  date: Date;
  events: CalendarEvent[];
  handleEdit: (event: CalendarEvent) => void;
  handleDelete: (event: CalendarEvent) => void;
  formatEventDate: (dateString: string) => string;
  isUserLoggedIn: boolean;
  children: React.ReactNode; // Added children prop to the interface
}

const EventPopover: React.FC<EventPopoverProps> = ({
  date,
  events,
  handleEdit,
  handleDelete,
  formatEventDate,
  isUserLoggedIn,
  children
}) => {
  if (events.length === 0) return <>{children}</>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="cursor-pointer w-full h-full">
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="bg-primary text-white p-3 font-medium rounded-t-md">
          {format(date, "yyyy년 MM월 dd일 EEEE", { locale: ko })}
        </div>
        <div className="p-3 max-h-[300px] overflow-y-auto">
          <div className="space-y-2">
            {events.length > 0 ? (
              events.map((event) => (
                <EventItem 
                  key={event.id}
                  event={event}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  formatEventDate={formatEventDate}
                  isUserLoggedIn={isUserLoggedIn}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                일정이 없습니다
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EventPopover;
