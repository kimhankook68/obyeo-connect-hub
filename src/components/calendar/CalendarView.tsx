
import React, { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO, addMonths, subMonths, isEqual, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import EventItem from "./EventItem";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      setDate(subMonths(date, 1));
    }
  };

  const goToNextMonth = () => {
    if (date) {
      setDate(addMonths(date, 1));
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
    <div className="flex flex-col gap-6">
      <div className="bg-white p-4 rounded-lg border w-full">
        <div className="w-full">
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
            <>
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
              
              <div className="aspect-[7/5] w-full">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full h-full rounded-md border"
                  locale={ko}
                  styles={{
                    day: { padding: "0.5rem" }
                  }}
                  classNames={{
                    month: "space-y-0 w-full",
                    row: "flex w-full",
                    day: "h-full text-left p-1 relative border border-gray-100",
                    day_today: "bg-blue-50",
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
                      const eventCount = getEventCountForDay(date);
                      const isCurrentMonth = displayMonth;
                      
                      return (
                        <div className="h-full w-full">
                          <div className={`${
                            date.getDay() === 0 ? 'text-red-500' : 
                            date.getDay() === 6 ? 'text-blue-500' : ''
                          } ${isCurrentMonth ? '' : 'text-gray-300'} font-normal text-xs`}>
                            {dayNum}
                          </div>
                          
                          {eventCount > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                              <Badge variant="outline" className="h-1.5 w-1.5 p-0 rounded-full bg-primary border-0" />
                              {eventCount > 1 && (
                                <Badge variant="outline" className="h-1.5 w-1.5 p-0 rounded-full bg-primary border-0" />
                              )}
                              {eventCount > 2 && (
                                <Badge variant="outline" className="h-1.5 w-1.5 p-0 rounded-full bg-primary border-0" />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  }}
                />
              </div>
            </>
          )}
          
          {viewMode === "week" && (
            <div className="border rounded-md w-full">
              <div className="grid grid-cols-7 text-center bg-gray-50 py-2 border-b">
                {weekDates.map((weekDay, idx) => (
                  <div 
                    key={idx}
                    className={`${
                      weekDay.getDay() === 0 ? 'text-red-500' : 
                      weekDay.getDay() === 6 ? 'text-blue-500' : ''
                    } font-medium`}
                  >
                    {format(weekDay, "EEE", { locale: ko })}
                    <div className="mt-1">{format(weekDay, "d", { locale: ko })}</div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 h-[300px]">
                {weekDates.map((day, idx) => {
                  const dayEvents = events.filter(event => {
                    const eventDate = parseISO(event.start_time);
                    return isSameDay(eventDate, day);
                  });
                  
                  return (
                    <div 
                      key={idx} 
                      className={`border-r h-full p-1 overflow-y-auto ${
                        isSameDay(day, new Date()) ? 'bg-blue-50' : ''
                      } ${isSameDay(day, date || new Date()) ? 'bg-primary/5' : ''}`}
                      onClick={() => setDate(day)}
                    >
                      {dayEvents.length > 0 ? (
                        <div className="flex justify-center">
                          {dayEvents.length > 0 && (
                            <Badge className="text-xs bg-primary">{dayEvents.length}개 일정</Badge>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-xs text-gray-400">일정 없음</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {viewMode === "day" && (
            <div className="border rounded-md w-full">
              <div className="bg-gray-50 py-2 border-b text-center">
                <div className="font-medium">
                  {date ? format(date, "yyyy년 MM월 dd일 EEEE", { locale: ko }) : ""}
                </div>
              </div>
              
              <div className="h-[400px] p-4 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="space-y-2">
                    {filteredEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: event.type === 'meeting' ? '#dc3545' : 
                              event.type === 'training' ? '#0dcaf0' : 
                              event.type === 'event' ? '#ffc107' : 
                              event.type === 'volunteer' ? '#198754' : '#6c757d'
                          }}
                        />
                        <div className="text-sm">
                          <span className="font-medium">{format(parseISO(event.start_time), "HH:mm")} - </span>
                          {event.title}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="text-lg">해당 날짜에 등록된 일정이 없습니다.</div>
                  </div>
                )}
              </div>
            </div>
          )}
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
