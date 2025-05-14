
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
        
        {/* 이벤트 표시 영역 - 최소 높이 설정 */}
        <div className="min-h-[1.75rem] max-h-[1.75rem] overflow-y-auto overflow-x-hidden">
          {isCurrentMonth && dayEvents.length > 0 && (
            <EventPopover
              date={day}
              events={dayEvents}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              formatEventDate={formatEventDate}
              isUserLoggedIn={isUserLoggedIn}
            >
              <div className="space-y-[2px]">
                {dayEvents.slice(0, 1).map(event => (
                  <div 
                    key={event.id}
                    className={cn(
                      "text-[10px] px-1 py-[1px] rounded text-white truncate leading-tight",
                      getEventColor(event.type)
                    )}
                  >
                    {event.title}
                  </div>
                ))}
                
                {dayEvents.length > 1 && (
                  <div className="text-[9px] text-blue-600 font-medium px-1 leading-tight">
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
