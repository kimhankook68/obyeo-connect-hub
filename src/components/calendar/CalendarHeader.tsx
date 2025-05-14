
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

interface CalendarHeaderProps {
  viewMode: "month" | "week" | "day";
  setViewMode: (mode: "month" | "week" | "day") => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  viewMode,
  setViewMode,
  date,
  setDate
}) => {
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

  // Navigate to previous period
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
  
  // Navigate to next period
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
  
  // Navigate to today
  const goToToday = () => {
    setDate(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-4 p-2">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={navigatePrevious}>
          <span className="sr-only">이전</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left h-4 w-4">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Button>
        
        <Button variant="outline" size="sm" onClick={goToToday}>
          오늘
        </Button>
        
        <Button variant="outline" size="sm" onClick={navigateNext}>
          <span className="sr-only">다음</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-4 w-4">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              보기: {getViewLabel()}
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
      </div>
    </div>
  );
};

export default CalendarHeader;
