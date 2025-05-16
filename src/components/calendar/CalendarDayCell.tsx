
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
  handleAddEvent?: (day: Date) => void;
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
  isUserLoggedIn,
  handleAddEvent
}) => {
  const isToday = isSameDay(day, new Date());
  const isCurrentMonth = isSameMonth(day, currentMonth);
  
  // 날짜 셀 빈 공간 클릭 시 동작 (새 일정 추가)
  const onEmptyCellClick = (e: React.MouseEvent) => {
    // 이벤트 버블링 방지
    e.stopPropagation();
    
    // 날짜 선택 기능 유지
    handleDateClick(day);
    
    // 사용자가 로그인되어 있고 현재 달의 날짜인 경우에만 일정 추가 동작 실행
    if (isUserLoggedIn && isCurrentMonth && handleAddEvent) {
      handleAddEvent(day);
    }
  };
  
  // 일정 클릭 핸들러 - 이벤트 세부 정보 표시
  const onEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    handleEdit(event); // 이 함수는 이제 수정뿐만 아니라 세부 정보 표시에도 사용
  };
  
  // 화면에 표시할 일정 최대 개수 (5개로 변경)
  const maxEventsToShow = 5;
  
  return (
    <td 
      className={cn(
        "relative p-0 align-top cursor-pointer hover:bg-gray-50 transition-colors w-[calc(100%/7)]",
        !isCurrentMonth && "text-gray-400 bg-gray-50",
        isSelected && "bg-blue-50"
      )}
    >
      <div className="flex flex-col h-full">
        {/* 날짜 번호 */}
        <div 
          onClick={onEmptyCellClick}
          className={cn(
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
        
        {/* 이벤트 표시 영역 - 영역 높이 조정 및 overflow 처리 */}
        <div 
          className="overflow-y-auto overflow-x-hidden"
          style={{ minHeight: '1.75rem', maxHeight: `${maxEventsToShow * 1.1}rem` }}
          onClick={onEmptyCellClick} // 빈 영역 클릭 시에도 일정 추가
        >
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
                {/* 일정 5개까지 표시하도록 수정 */}
                {dayEvents.slice(0, maxEventsToShow).map(event => (
                  <div 
                    key={event.id}
                    className={cn(
                      "text-[10px] px-1 py-[1px] rounded text-white truncate leading-tight",
                      getEventColor(event.type)
                    )}
                    onClick={(e) => onEventClick(event, e)}
                  >
                    {event.title}
                  </div>
                ))}
                
                {/* 추가 일정이 있는 경우 "더보기" 표시 */}
                {dayEvents.length > maxEventsToShow && (
                  <div 
                    className="text-[9px] text-blue-600 font-medium px-1 leading-tight"
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 버블링 방지
                      // 날짜만 선택하고 팝업은 열리지 않게 함
                      handleDateClick(day);
                    }}
                  >
                    +{dayEvents.length - maxEventsToShow}개 더보기
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
