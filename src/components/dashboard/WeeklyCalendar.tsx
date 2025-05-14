
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardCard from '@/components/DashboardCard';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const WeeklyCalendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();

  // Calculate week dates
  const weekDates = React.useMemo(() => {
    const start = startOfWeek(date, { weekStartsOn: 0 }); // Start from Sunday
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [date]);

  useEffect(() => {
    const fetchWeekEvents = async () => {
      const startDate = startOfWeek(date, { weekStartsOn: 0 });
      const endDate = endOfWeek(date, { weekStartsOn: 0 });

      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString())
          .order('start_time', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching weekly events:', error);
      }
    };

    fetchWeekEvents();
  }, [date]);

  // Navigate to previous week
  const previousWeek = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 7);
    setDate(newDate);
  };

  // Navigate to next week
  const nextWeek = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 7);
    setDate(newDate);
  };

  // Get events for a specific date
  const getEventsForDate = (day: Date) => {
    return events.filter(event => isSameDay(parseISO(event.start_time), day));
  };

  // Get weekday name in Korean
  const getWeekdayName = (day: Date) => {
    return format(day, 'EEE', { locale: ko });
  };

  return (
    <DashboardCard 
      title="주간 일정" 
      action={<Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>더보기</Button>}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <Button variant="outline" size="sm" onClick={previousWeek}>
            <span className="sr-only">이전 주</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left h-4 w-4">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Button>
          
          <div className="text-sm font-medium">
            {format(weekDates[0], 'yyyy년 MM월 dd일')} - {format(weekDates[6], 'MM월 dd일')}
          </div>
          
          <Button variant="outline" size="sm" onClick={nextWeek}>
            <span className="sr-only">다음 주</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-4 w-4">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((day, index) => (
            <div 
              key={index} 
              className={`text-center text-xs font-medium p-1 ${
                day.getDay() === 0 ? 'text-red-500' : 
                day.getDay() === 6 ? 'text-blue-500' : ''
              }`}
            >
              {getWeekdayName(day)}
            </div>
          ))}
          
          {weekDates.map((day, index) => (
            <div 
              key={`day-${index}`}
              className={`border rounded-md p-1 min-h-[60px] text-center cursor-pointer ${
                isSameDay(day, new Date()) ? 'bg-primary/10 border-primary/30' : ''
              }`}
              onClick={() => {
                setDate(day);
              }}
            >
              <div className="text-sm font-medium mb-1">{day.getDate()}</div>
              <div className="space-y-1">
                {getEventsForDate(day).slice(0, 2).map(event => (
                  <div 
                    key={event.id} 
                    className="text-xs p-1 rounded truncate"
                    style={{
                      backgroundColor: event.type === 'meeting' ? '#dc3545' : 
                        event.type === 'training' ? '#0dcaf0' : 
                        event.type === 'event' ? '#ffc107' : 
                        event.type === 'volunteer' ? '#198754' : '#6c757d',
                      color: 'white'
                    }}
                  >
                    {format(parseISO(event.start_time), 'HH:mm')}
                  </div>
                ))}
                {getEventsForDate(day).length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{getEventsForDate(day).length - 2}개
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">
            {format(date, 'yyyy년 MM월 dd일 (EEE)', { locale: ko })}의 일정
          </h3>
          
          <div className="grid grid-cols-3 gap-2">
            {getEventsForDate(date).slice(0, 6).map(event => (
              <div 
                key={event.id} 
                className="p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/calendar?event=${event.id}`)}
              >
                <h4 className="font-medium line-clamp-1 text-sm">{event.title}</h4>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span className="mr-1">🕒</span>
                  <span>{format(parseISO(event.start_time), 'HH:mm')}</span>
                </div>
                {event.location && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span className="mr-1">📍</span>
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
              </div>
            ))}
            {getEventsForDate(date).length === 0 && (
              <div className="col-span-3 text-center py-4 text-muted-foreground text-sm">
                해당 날짜에 일정이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default WeeklyCalendar;
