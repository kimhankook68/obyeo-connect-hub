
import React, { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO, addMonths, subMonths, isEqual } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import EventItem from "./EventItem";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

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
  
  // 현재 달과 다음, 이전 달로 이동하는 함수
  const goToPreviousMonth = () => {
    if (date) {
      setDate(subMonths(date, 1));
    }
  };

  const goToNextMonth = () => {
    if (date) {
      setDate(addMonths(date, 1));
    }
  };

  // 특정 날짜의 이벤트를 가져오는 함수
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStartDate = parseISO(event.start_time);
      return isSameDay(eventStartDate, day);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-4 rounded-lg border w-full">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium">
              {date ? format(date, "yyyy.MM", { locale: ko }) : ""}
            </h2>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* 요일 표시 */}
          <div className="grid grid-cols-7 text-center mb-2">
            <div className="text-red-500">일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div className="text-blue-500">토</div>
          </div>
          
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full rounded-md border"
            locale={ko}
            modifiers={{
              event: (day) => isDayWithEvent(day)
            }}
            modifiersClassNames={{
              event: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
            }}
            styles={{
              day: { padding: "0.5rem" }
            }}
            classNames={{
              month: "space-y-0",
              row: "flex w-full",
              day: "h-16 text-left p-1 relative border border-gray-100",
              day_today: "bg-gray-50",
              day_selected: "bg-primary/10 text-primary font-bold",
              head_row: "flex w-full",
              head_cell: "text-center text-muted-foreground w-10 h-10",
              caption_dropdowns: "hidden",
              nav: "hidden",
              caption: "hidden"
            }}
            components={{
              DayContent: (props) => {
                const { date, displayMonth } = props;
                const dayNum = date.getDate();
                const dayEvents = getEventsForDay(date);
                const isCurrentMonth = displayMonth;
                
                return (
                  <div className="h-full w-full">
                    <div className={`${
                      date.getDay() === 0 ? 'text-red-500' : 
                      date.getDay() === 6 ? 'text-blue-500' : ''
                    } ${isCurrentMonth ? '' : 'text-gray-300'} font-normal text-xs`}>
                      {dayNum}
                    </div>
                    <div className="mt-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event, idx) => (
                        <div 
                          key={idx}
                          className="text-xs truncate rounded px-1 mb-0.5"
                          style={{
                            backgroundColor: event.type === 'meeting' ? '#f8d7da' : 
                                          event.type === 'training' ? '#d1ecf1' : 
                                          event.type === 'event' ? '#fff3cd' : 
                                          event.type === 'volunteer' ? '#d4edda' : '#e2e3e5',
                            color: event.type === 'meeting' ? '#721c24' : 
                                 event.type === 'training' ? '#0c5460' : 
                                 event.type === 'event' ? '#856404' : 
                                 event.type === 'volunteer' ? '#155724' : '#383d41'
                          }}
                        >
                          {format(parseISO(event.start_time), "HH:mm")} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">+ {dayEvents.length - 2} 더보기</div>
                      )}
                    </div>
                  </div>
                );
              }
            }}
          />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
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
