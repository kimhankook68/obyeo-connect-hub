
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import EventDetailsDialog from '@/components/calendar/EventDetailsDialog';

const MiniCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  // 이전 달로 이동
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // 다음 달로 이동
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // 해당 월의 모든 날짜를 가져옴
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일부터 시작
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // 주 단위로 그룹화
    const weeks = [];
    let week = [];
    
    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    return weeks;
  };
  
  // 캘린더 이벤트 가져오기
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (error) {
        console.error('이벤트 가져오기 오류:', error);
        return;
      }
      
      setEvents(data || []);
    };
    
    fetchEvents();
  }, [currentMonth]);
  
  // 특정 날짜에 이벤트가 있는지 확인
  const hasEventOnDay = (day: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, day);
    });
  };

  // 특정 날짜의 이벤트 가져오기
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, day);
    });
  };
  
  // 날짜 클릭 핸들러
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    
    // 이벤트 목록 페이지로 이동 및 날짜 전달
    navigate(`/calendar?date=${format(day, 'yyyy-MM-dd')}`);
  };
  
  // 새 일정 추가 핸들러
  const handleAddEvent = () => {
    // 현재 선택된 날짜가 있는지 확인
    if (!selectedDate) return;
    
    // 현재 선택된 날짜와 함께 일정 추가 창 열기 상태 전달
    navigate('/calendar', { 
      state: { 
        openEventModal: true,
        selectedDate: format(selectedDate, 'yyyy-MM-dd')
      },
      replace: true // 기존 상태를 대체하여 중복 실행 방지
    });
  };
  
  // 일정 클릭 핸들러 - 상세 보기 다이얼로그 표시
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지 (날짜 클릭 이벤트가 발생하지 않도록)
    setSelectedEvent(event);
    setDetailsDialogOpen(true);
  };
  
  // 일정 수정 핸들러
  const handleEditEvent = () => {
    if (selectedEvent) {
      navigate(`/calendar?event=${selectedEvent.id}`);
      setDetailsDialogOpen(false);
    }
  };
  
  // 일정 삭제 핸들러 - 미니 캘린더에서는 삭제 기능은 제공하지 않고 캘린더 페이지로 이동
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      navigate(`/calendar?event=${selectedEvent.id}`);
      setDetailsDialogOpen(false);
    }
  };
  
  const weeks = getDaysInMonth();
  const todayEvents = selectedDate ? getEventsForDay(selectedDate) : [];
  
  // 로그인 여부 확인 (간소화된 방식, 실제로는 인증 상태를 확인하는 로직 필요)
  const isUserLoggedIn = true;
  
  // 이벤트 수정 권한 확인 (간소화된 방식)
  const canEditEvent = true;
  
  return (
    <div className="px-2 py-3">
      <div className="text-sm font-medium mb-2 flex items-center justify-between">
        <button onClick={prevMonth} className="p-1 hover:bg-secondary rounded-md">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span>{format(currentMonth, 'yyyy년 M월', { locale: ko })}</span>
        <button onClick={nextMonth} className="p-1 hover:bg-secondary rounded-md">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <table className="w-full text-center text-xs">
        <thead>
          <tr>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <th 
                key={day} 
                className={cn(
                  "py-1 font-normal",
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : ""
                )}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((day, j) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const hasEvent = hasEventOnDay(day);
                
                return (
                  <td 
                    key={j}
                    onClick={() => isCurrentMonth && handleDateClick(day)}
                    className={cn(
                      "py-1 cursor-pointer relative",
                      !isCurrentMonth && "text-gray-400",
                      isToday && "font-bold",
                      isSelected && "bg-blue-100 rounded",
                      j === 0 && isCurrentMonth && "text-red-500",
                      j === 6 && isCurrentMonth && "text-blue-500"
                    )}
                  >
                    {format(day, 'd')}
                    {hasEvent && isCurrentMonth && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDate && (
        <div className="mt-2 pt-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-medium">
              {format(selectedDate, 'yyyy-MM-dd', { locale: ko })}
            </p>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5" 
              onClick={handleAddEvent}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-1 max-h-20 overflow-auto">
            {todayEvents.length > 0 ? (
              todayEvents.slice(0, 3).map((event) => (
                <div 
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  className={cn(
                    "text-[10px] p-1 rounded truncate cursor-pointer",
                    event.type === "meeting" ? "bg-red-100 text-red-800" : 
                    event.type === "training" ? "bg-blue-100 text-blue-800" : 
                    event.type === "event" ? "bg-amber-100 text-amber-800" : 
                    event.type === "volunteer" ? "bg-green-100 text-green-800" : 
                    "bg-gray-100 text-gray-800"
                  )}
                >
                  {event.title}
                </div>
              ))
            ) : (
              <div className="text-[10px] text-muted-foreground p-1">일정 없음</div>
            )}
            
            {todayEvents.length > 3 && (
              <div className="text-[10px] text-blue-500 p-1">
                +{todayEvents.length - 3}개 더 있음
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 일정 상세 다이얼로그 */}
      <EventDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        isUserLoggedIn={isUserLoggedIn}
        canEditEvent={canEditEvent}
      />
    </div>
  );
};

export default MiniCalendar;
