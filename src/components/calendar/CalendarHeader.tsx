
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarIcon, CalendarDays, CalendarCheck } from "lucide-react";
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

  // 오늘로 이동
  const goToToday = () => {
    setDate(new Date());
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm mb-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={goToToday} className="min-w-[70px]">
          오늘
        </Button>
        
        <Button variant="outline">
          일정
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {getViewIcon()}
              {getViewLabel()}
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewMode("month")}>
              <CalendarCheck className="h-4 w-4 mr-2" />
              월간
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewMode("week")}>
              <CalendarDays className="h-4 w-4 mr-2" />
              주간
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewMode("day")}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              일간
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {isUserLoggedIn && handleAddEvent && (
          <Button onClick={handleAddEvent} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            새 일정
          </Button>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
