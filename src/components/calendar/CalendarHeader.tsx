
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarIcon, CalendarDays, CalendarCheck, format } from "lucide-react";
import { format as dateFormat } from "date-fns";
import { ko } from "date-fns/locale";

interface CalendarHeaderProps {
  viewMode: "month" | "week" | "day";
  setViewMode: (mode: "month" | "week" | "day") => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  handleAddEvent?: () => void;
  isUserLoggedIn: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  viewMode,
  setViewMode,
  date,
  setDate,
  handleAddEvent,
  isUserLoggedIn
}) => {
  // 현재 달력 모드에 따른 라벨 가져오기
  const getViewLabel = () => {
    switch (viewMode) {
      case "day":
        return "일간";
      case "week":
        return "주간";
      case "month":
        return "월간";
      default:
        return "월간";
    }
  };

  // 현재 달력 모드에 따른 아이콘 가져오기
  const getViewIcon = () => {
    switch (viewMode) {
      case "day":
        return <CalendarIcon className="h-4 w-4 mr-2" />;
      case "week":
        return <CalendarDays className="h-4 w-4 mr-2" />;
      case "month":
        return <CalendarCheck className="h-4 w-4 mr-2" />;
      default:
        return <CalendarCheck className="h-4 w-4 mr-2" />;
    }
  };

  // 이전 기간으로 이동
  const navigatePrevious = () => {
    if (!date) return;
    
    const newDate = new Date(date);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setDate(newDate);
  };
  
  // 다음 기간으로 이동
  const navigateNext = () => {
    if (!date) return;
    
    const newDate = new Date(date);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setDate(newDate);
  };
  
  // 오늘로 이동
  const goToToday = () => {
    setDate(new Date());
  };

  // 현재 달력 모드에 따른 헤더 타이틀
  const getHeaderTitle = () => {
    if (!date) return "";
    
    if (viewMode === "day") {
      return dateFormat(date, "yyyy년 MM월 dd일", { locale: ko });
    } else if (viewMode === "week") {
      const start = new Date(date);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      
      if (start.getMonth() === end.getMonth()) {
        return `${dateFormat(start, "yyyy년 MM월", { locale: ko })}`;
      } else {
        return `${dateFormat(start, "yyyy년 MM월", { locale: ko })} - ${dateFormat(end, "MM월", { locale: ko })}`;
      }
    } else {
      return dateFormat(date, "yyyy년 MM월", { locale: ko });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm mb-4">
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <Button variant="outline" size="icon" onClick={navigatePrevious}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left h-4 w-4">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Button>
        
        <Button variant="outline" onClick={goToToday} className="min-w-[70px]">
          오늘
        </Button>
        
        <Button variant="outline" size="icon" onClick={navigateNext}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-4 w-4">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </Button>
        
        <h2 className="text-lg font-medium hidden md:block">
          {getHeaderTitle()}
        </h2>
      </div>
      
      <h2 className="text-lg font-medium block md:hidden">
        {getHeaderTitle()}
      </h2>
      
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {getViewIcon()}
              {getViewLabel()} 보기
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewMode("day")}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              일간
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewMode("week")}>
              <CalendarDays className="h-4 w-4 mr-2" />
              주간
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewMode("month")}>
              <CalendarCheck className="h-4 w-4 mr-2" />
              월간
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {isUserLoggedIn && handleAddEvent && (
          <Button onClick={handleAddEvent} className="hidden sm:flex items-center gap-1">
            <Plus className="h-4 w-4" />
            새 일정
          </Button>
        )}
        
        {isUserLoggedIn && handleAddEvent && (
          <Button onClick={handleAddEvent} size="icon" className="sm:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
