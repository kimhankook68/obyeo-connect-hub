
import React from "react";
import { cn } from "@/lib/utils";

interface CalendarWeekdayHeaderProps {
  weekdayLabels?: string[];
  viewMode?: "month" | "week" | "day";
  setViewMode?: (mode: "month" | "week" | "day") => void;
  date?: Date;
  setDate?: (date: Date | undefined) => void;
  handleAddEvent?: () => void;
  isUserLoggedIn?: boolean;
}

const CalendarWeekdayHeader: React.FC<CalendarWeekdayHeaderProps> = ({
  weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"], // Default value for weekdayLabels
  viewMode,
  setViewMode,
  date,
  setDate,
  handleAddEvent,
  isUserLoggedIn
}) => {
  return (
    <thead>
      <tr className="border-b">
        {weekdayLabels.map((day, index) => (
          <th 
            key={day} 
            className={cn(
              "py-2 text-center text-sm font-normal",
              index === 0 ? "text-red-500" : 
              index === 6 ? "text-blue-500" : 
              "text-gray-700"
            )}
          >
            {day}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default CalendarWeekdayHeader;
