
import React, { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO, addMonths, subMonths, isEqual, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import EventItem from "./EventItem";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-white p-4 rounded-lg border w-full flex-1 flex flex-col">
        <div className="w-full flex-1 flex flex-col">
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
            <div className="flex-1 flex flex-col">
              {/* 요일 표시 */}
              <div className="grid grid-cols-7 text-center mb-2 font-medium">
                <div className="text-red-500">일</div>
                <div>월</div>
                <div>화</div>
                <div>수</div>
                <div>목</div>
                <div>금</div>
                <div className="text-blue-500">토</div>
              </div>
              
              <div className="flex-1 w-full h-full">
                <AspectRatio ratio={7/5} className="h-full">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="w-full h-full rounded-md border"
                    locale={ko}
                    classNames={{
                      month: "space-y-0 w-full h-full",
                      row: "flex w-full flex-1",
                      day: "h-full text-left p-1 relative border border-gray-100 hover:bg-blue-50 transition-colors duration-200",
                      day_today: "bg-blue-50 font-bold",
                      day_selected: "bg-primary/10 text-primary font-bold",
                      head_row: "flex w-full",
                      head_cell: "text-center text-muted-foreground w-10 h-10",
                      caption_dropdowns: "hidden",
                      nav: "hidden",
                      caption: "hidden",
                      table: "w-full h-full border-collapse"
                    }}
                    components={{
                      DayContent: (props) => {
                        const { date, displayMonth } = props;
                        const dayNum = date.getDate();
                        const eventCount = getEventCountForDay(date);
                        const isCurrentMonth = displayMonth;
                        
                        return (
                          <div className="h-full w-full flex flex-col justify-between">
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
                </AspectRatio>
              </div>
            </div>
          )}
          
          {viewMode === "week" && (
            <div className="border rounded-md w-full h-full flex-1 flex flex-col">
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
              
              <div className="grid grid-cols-7 flex-1 min-h-[300px]">
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
                        <div className="flex justify-center mt-2">
                          {dayEvents.length > 0 && (
                            <Badge className="text-xs bg-primary">{dayEvents.length}개 일정</Badge>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-xs text-gray-400 mt-2">일정 없음</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {viewMode === "day" && (
            <div className="border rounded-md w-full h-full flex-1 flex flex-col">
              <div className="bg-gray-50 py-2 border-b text-center">
                <div className="font-medium">
                  {date ? format(date, "yyyy년 MM월 dd일 EEEE", { locale: ko }) : ""}
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto min-h-[400px]">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="space-y-2">
                    {filteredEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="flex items-center space-x-2 p-3 rounded hover:bg-gray-50 border border-gray-100 shadow-sm"
                      >
                        <div 
                          className="w-3 h-10 rounded-l-md"
                          style={{
                            backgroundColor: event.type === 'meeting' ? '#dc3545' : 
                              event.type === 'training' ? '#0dcaf0' : 
                              event.type === 'event' ? '#ffc107' : 
                              event.type === 'volunteer' ? '#198754' : '#6c757d'
                          }}
                        />
                        <div>
                          <span className="font-medium">{format(parseISO(event.start_time), "HH:mm")} - </span>
                          <span>{event.title}</span>
                          <div className="text-sm text-gray-500">
                            {event.location && (
                              <span className="mr-2">📍 {event.location}</span>
                            )}
                          </div>
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
