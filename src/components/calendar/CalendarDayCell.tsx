
import React from "react";
import { isSameDay, parseISO, format, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import EventPopover from "./EventPopover";

interface CalendarDayCellProps {
  day: Date;
  currentMonth: Date;
  isSelected: boolean;
  dayEvents: CalendarEvent[];
  dayIndex: number;
  handleDateClick: (day: Date) => void;
  getEventColor: (type: string) => string;
  handleEdit: (event: CalendarEvent) => void;
  handleDelete: (event: CalendarEvent) => void;
  formatEventDate: (dateString: string) => string;
  isUserLoggedIn: boolean;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day,
  currentMonth,
  isSelected,
  dayEvents,
  dayIndex,
  handleDateClick,
  getEventColor,
  handleEdit,
  handleDelete,
  formatEventDate,
  isUserLoggedIn
}) => {
  const isToday = isSameDay(day, new Date());
  const isCurrentMonth = isSameMonth(day, currentMonth);
  
  return (
    <td 
      onClick={() => handleDateClick(day)}
      className={cn(
        "relative p-0 align-top cursor-pointer hover:bg-gray-50 transition-colors",
        !isCurrentMonth && "text-gray-400 bg-gray-50",
        isSelected && "bg-blue-50"
      )}
    >
      <div className="flex flex-col h-full p-1">
        {/* 날짜 번호 */}
        <div className={cn(
          "flex justify-center items-center",
          dayIndex === 0 ? "text-red-500" : 
          dayIndex === 6 ? "text-blue-500" : "",
          !isCurrentMonth && "text-gray-400"
        )}>
          <span className={cn(
            "text-center w-6 h-6 flex items-center justify-center",
            isToday && isCurrentMonth && "bg-blue-500 text-white rounded-full"
          )}>
            {format(day, "d")}
          </span>
        </div>
        
        {/* 이벤트 표시 영역 - 균등한 높이 분배를 위해 flex-1 사용 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {isCurrentMonth && dayEvents.length > 0 && (
            <EventPopover
              date={day}
              events={dayEvents}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              formatEventDate={formatEventDate}
              isUserLoggedIn={isUserLoggedIn}
            >
              <div className="space-y-1">
                {dayEvents.slice(0, 1).map(event => (
                  <div 
                    key={event.id}
                    className={cn(
                      "text-xs px-1 py-0.5 rounded text-white truncate",
                      getEventColor(event.type)
                    )}
                  >
                    {format(parseISO(event.start_time), "HH:mm")}
                  </div>
                ))}
                
                {dayEvents.length > 1 && (
                  <div className="text-xs text-blue-600 font-medium px-1">
                    +{dayEvents.length - 1}개 더보기
                  </div>
                )}
              </div>
            </EventPopover>
          )}
        </div>
      </div>
    </td>
  );
};

export default CalendarDayCell;
