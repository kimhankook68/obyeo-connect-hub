
import React from "react";
import { isSameDay, parseISO } from "date-fns";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import CalendarWeekdayHeader from "./CalendarHeader";
import CalendarDayCell from "./CalendarDayCell";

interface CalendarGridProps {
  calendarDays: Date[][];
  weekdayLabels: string[];
  currentMonth: Date;
  date: Date | undefined;
  getEventColor: (type: string) => string;
  handleDateClick: (day: Date) => void;
  events: CalendarEvent[];
  handleEdit: (event: CalendarEvent) => void;
  handleDelete: (event: CalendarEvent) => void;
  formatEventDate: (dateString: string) => string;
  isUserLoggedIn: boolean;
  handleAddEvent?: (day: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarDays,
  weekdayLabels,
  currentMonth,
  date,
  getEventColor,
  handleDateClick,
  events,
  handleEdit,
  handleDelete,
  formatEventDate,
  isUserLoggedIn,
  handleAddEvent
}) => {
  // 해당 날짜의 이벤트 필터링
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(parseISO(event.start_time), day));
  };
  
  return (
    <table className="w-full h-full border-collapse table-fixed">
      <CalendarWeekdayHeader weekdayLabels={weekdayLabels} />
      <tbody className="divide-y">
        {calendarDays.map((week, weekIndex) => (
          <tr key={weekIndex} className="divide-x" style={{ height: `calc(100% / ${calendarDays.length})` }}>
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = date && isSameDay(day, date);
              
              return (
                <CalendarDayCell 
                  key={dayIndex}
                  day={day}
                  currentMonth={currentMonth}
                  isSelected={isSelected}
                  dayEvents={dayEvents}
                  dayIndex={dayIndex}
                  handleDateClick={handleDateClick}
                  getEventColor={getEventColor}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  formatEventDate={formatEventDate}
                  isUserLoggedIn={isUserLoggedIn}
                  handleAddEvent={handleAddEvent}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CalendarGrid;
