
import React from "react";
import { cn } from "@/lib/utils";

interface CalendarWeekdayHeaderProps {
  weekdayLabels: string[];
}

const CalendarWeekdayHeader: React.FC<CalendarWeekdayHeaderProps> = ({
  weekdayLabels
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
