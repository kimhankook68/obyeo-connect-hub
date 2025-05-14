
import React, { useMemo } from "react";
import { 
  isSameDay, 
  parseISO, 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isBefore,
  isAfter
} from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  events: CalendarEvent[];
  getEventCountForDay: (day: Date) => number;
  handleEdit: (event: CalendarEvent) => void;
  handleDelete: (event: CalendarEvent) => void;
  formatEventDate: (dateString: string) => string;
  isUserLoggedIn: boolean;
}

const MonthView: React.FC<MonthViewProps> = ({
  date,
  setDate,
  events,
  getEventCountForDay,
  handleEdit,
  handleDelete,
  formatEventDate,
  isUserLoggedIn
}) => {
  // 현재 달력에 표시되는 월
  const [currentMonth, setCurrentMonth] = React.useState<Date>(date || new Date());
  
  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // 날짜 클릭 핸들러 - 선택된 날짜를 업데이트하여 일정 목록 표시
  const handleDateClick = (day: Date | undefined) => {
    console.log("Date clicked:", day);
    setDate(day);
  };

  // 달력에 표시할 날짜 배열 생성
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // 주 단위로 날짜 그룹화
    const weeks = [];
    let week = [];
    
    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);
      
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    return weeks;
  }, [currentMonth]);
  
  // 이벤트 유형별 색상
  const getEventColor = (type: string): string => {
    switch (type) {
      case "meeting": return "bg-red-500";
      case "training": return "bg-blue-500";
      case "event": return "bg-amber-500";
      case "volunteer": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };
  
  // 달력 헤더 요일 배열
  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, "yyyy.MM", { locale: ko })}
        </h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToPreviousMonth} 
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* 테이블 형태의 달력 */}
      <div className="border rounded-md overflow-hidden h-full">
        <table className="w-full h-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              {weekdayLabels.map((day, index) => (
                <th 
                  key={day} 
                  className={cn(
                    "py-2 text-center text-sm font-medium border-r last:border-r-0",
                    index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-700"
                  )}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarDays.map((week, weekIndex) => (
              <tr key={weekIndex} className="h-[calc(100%/6)] divide-y border-b last:border-b-0">
                {week.map((day, dayIndex) => {
                  // 해당 날짜의 이벤트 필터링
                  const dayEvents = events.filter(event => 
                    isSameDay(parseISO(event.start_time), day)
                  );
                  
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = date && isSameDay(day, date);
                  
                  return (
                    <td 
                      key={dayIndex}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "relative align-top border-r last:border-r-0 p-1 cursor-pointer hover:bg-gray-50 transition-colors",
                        !isCurrentMonth && "bg-gray-50 text-gray-400",
                        isSelected && "bg-blue-50"
                      )}
                    >
                      <div className="flex flex-col h-full">
                        {/* 날짜 번호 */}
                        <div className={cn(
                          "flex items-start h-7",
                          dayIndex === 0 ? "text-red-500" : 
                          dayIndex === 6 ? "text-blue-500" : 
                          "text-gray-700"
                        )}>
                          <span className={cn(
                            "text-sm font-medium",
                            !isCurrentMonth && "text-gray-400",
                            isToday && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          )}>
                            {format(day, "d")}
                          </span>
                          
                          {/* 휴일명 또는 기타 정보 */}
                          {day.getDate() === 1 && (
                            <span className="ml-1 text-xs text-gray-500">
                              {format(day, "(E)", { locale: ko })}
                            </span>
                          )}
                          {day.getDate() === 5 && day.getMonth() === 4 && (
                            <span className="ml-1 text-xs text-red-500">
                              어린이날
                            </span>
                          )}
                          {day.getDate() === 15 && day.getMonth() === 4 && (
                            <span className="ml-1 text-xs text-blue-500">
                              스승의날
                            </span>
                          )}
                        </div>
                        
                        {/* 이벤트 표시 영역 */}
                        <div className="flex-1 mt-1 overflow-hidden space-y-0.5">
                          {dayEvents.slice(0, 2).map(event => (
                            <div 
                              key={event.id}
                              className={cn(
                                "text-xs px-1 py-0.5 rounded text-white truncate",
                                getEventColor(event.type)
                              )}
                            >
                              {format(parseISO(event.start_time), "HH:mm")} {event.title}
                            </div>
                          ))}
                          
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-blue-600 font-medium">
                              +{dayEvents.length - 2}개 더보기
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthView;
