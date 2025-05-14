
import React from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarNavigationProps {
  currentMonth: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  currentMonth,
  goToPreviousMonth,
  goToNextMonth
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={goToPreviousMonth} 
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-sm font-medium">
        {format(currentMonth, "M월 yyyy", { locale: ko })}
      </div>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={goToNextMonth}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CalendarNavigation;
