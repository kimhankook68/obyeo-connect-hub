
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, CalendarMonth, Calendar as CalendarIcon } from "lucide-react";

interface CalendarHeaderProps {
  onAddEvent: () => void;
  view: "calendar" | "list";
  onViewChange: (view: "calendar" | "list") => void;
  viewMode: "month" | "week" | "day";
  onViewModeChange: (mode: "month" | "week" | "day") => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  onAddEvent, 
  view, 
  onViewChange,
  viewMode,
  onViewModeChange
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

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            onClick={onAddEvent}
          >
            <Plus className="h-4 w-4" />
            일정 추가
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                보기: {getViewLabel()}
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onViewModeChange("day")}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                일간
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewModeChange("week")}>
                <CalendarDays className="h-4 w-4 mr-2" />
                주간
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewModeChange("month")}>
                <CalendarMonth className="h-4 w-4 mr-2" />
                월간
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant={view === "calendar" ? "default" : "outline"}
            size="sm"
            className={view === "calendar" ? "bg-primary text-white" : ""}
            onClick={() => onViewChange("calendar")}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            캘린더
          </Button>
          
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            className={view === "list" ? "bg-primary text-white" : ""}
            onClick={() => onViewChange("list")}
          >
            리스트
          </Button>
        </div>
      </div>
    </>
  );
};

export default CalendarHeader;
