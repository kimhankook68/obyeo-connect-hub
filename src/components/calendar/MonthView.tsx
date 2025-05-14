
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
  isSameMonth
} from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CalendarNavigation from "./CalendarNavigation";
import CalendarGrid from "./CalendarGrid";

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
      <CalendarNavigation 
        currentMonth={currentMonth}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
      />
      
      {/* 달력 컨테이너를 flex-grow로 변경하여 전체 높이를 채우도록 */}
      <div className="flex-grow border rounded-md overflow-hidden">
        <div className="w-full h-full">
          <CalendarGrid 
            calendarDays={calendarDays}
            weekdayLabels={weekdayLabels}
            currentMonth={currentMonth}
            date={date}
            getEventColor={getEventColor}
            handleDateClick={handleDateClick}
            events={events}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            formatEventDate={formatEventDate}
            isUserLoggedIn={isUserLoggedIn}
          />
        </div>
      </div>
    </div>
  );
};

export default MonthView;
