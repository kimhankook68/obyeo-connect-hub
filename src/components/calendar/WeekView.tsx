
import React from "react";
import { isSameDay, parseISO, format, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  events: CalendarEvent[];
  weekDates: Date[];
  handleEdit?: (event: CalendarEvent) => void;
  handleDelete?: (event: CalendarEvent) => void;
  isUserLoggedIn: boolean;
}

const WeekView: React.FC<WeekViewProps> = ({
  date,
  setDate,
  events,
  weekDates,
  handleEdit,
  handleDelete,
  isUserLoggedIn
}) => {
  // 요일 배경색 설정
  const getDayBackground = (day: Date) => {
    if (isToday(day)) return "bg-primary/10 border-primary";
    if (date && isSameDay(day, date)) return "bg-muted/30";
    return "hover:bg-muted/20";
  };

  // 이벤트 유형별 색상 가져오기
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting": return "bg-red-500";
      case "training": return "bg-blue-500";
      case "event": return "bg-amber-500";
      case "volunteer": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="border rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 text-center bg-muted/10 border-b">
        {weekDates.map((weekDay, idx) => (
          <div 
            key={idx}
            className={cn(
              "p-3 font-medium",
              weekDay.getDay() === 0 ? "text-red-500" : 
              weekDay.getDay() === 6 ? "text-blue-500" : ""
            )}
          >
            <div className="text-sm lg:text-base">{format(weekDay, "EEE", { locale: ko })}</div>
            <div className={cn(
              "inline-flex items-center justify-center w-8 h-8 rounded-full mt-1",
              isToday(weekDay) ? "bg-primary text-primary-foreground" : ""
            )}>
              {format(weekDay, "d", { locale: ko })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 min-h-[500px]">
        {weekDates.map((day, idx) => {
          const dayEvents = events.filter(event => {
            const eventDate = parseISO(event.start_time);
            return isSameDay(eventDate, day);
          });
          
          return (
            <div 
              key={idx} 
              className={cn(
                "border-r min-h-[80px] h-full p-1 transition-colors cursor-pointer",
                getDayBackground(day)
              )}
              onClick={() => setDate(day)}
            >
              <div className="space-y-1 h-full overflow-y-auto">
                {dayEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className={cn(
                      "text-xs text-white p-1.5 rounded-md truncate mb-1 cursor-pointer hover:opacity-90",
                      getEventTypeColor(event.type)
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (handleEdit && isUserLoggedIn) handleEdit(event);
                    }}
                  >
                    <div className="font-medium">{format(parseISO(event.start_time), "HH:mm")}</div>
                  </div>
                ))}
                {dayEvents.length === 0 && (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    <span>일정 없음</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
