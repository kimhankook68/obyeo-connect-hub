
import React, { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import EventItem from "./EventItem";
import { isEqual } from "date-fns";

interface CalendarViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  events: CalendarEvent[];
  loading: boolean;
  handleEdit: (event: CalendarEvent) => void;
  handleDelete: (event: CalendarEvent) => void;
  formatEventDate: (dateString: string) => string;
  isUserLoggedIn: boolean;
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

  // 특정 날짜에 이벤트가 있는지 확인하는 함수
  const isDayWithEvent = (day: Date) => {
    return eventDates.some(eventDate => 
      isEqual(
        new Date(day.getFullYear(), day.getMonth(), day.getDate()),
        eventDate
      )
    );
  };

  // 날짜에 따른 이벤트 필터링
  const filteredEvents = date
    ? events.filter((event) => {
        const eventStartDate = parseISO(event.start_time);
        return isSameDay(eventStartDate, date);
      })
    : events;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2 bg-card p-4 rounded-lg border w-full">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full rounded-md border"
          locale={ko}
          modifiers={{
            event: (date) => isDayWithEvent(date)
          }}
          modifiersClassNames={{
            event: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
          }}
        />
      </div>
      
      <div className="md:w-1/2">
        <h2 className="text-lg font-medium mb-4">
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
          <div className="space-y-4">
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
    </div>
  );
};

export default CalendarView;
