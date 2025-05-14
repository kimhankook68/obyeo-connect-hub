
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CalendarHeaderProps {
  onAddEvent: () => void;
  view: "calendar" | "list";
  onViewChange: (view: "calendar" | "list") => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  onAddEvent, 
  view, 
  onViewChange 
}) => {
  const [viewFilter, setViewFilter] = useState<string>("월간");
  
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
                보기: {viewFilter}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setViewFilter("일간")}>
                일간
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewFilter("주간")}>
                주간
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewFilter("월간")}>
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
            <Calendar className="h-4 w-4 mr-1" />
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
