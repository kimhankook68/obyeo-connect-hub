
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import DashboardCard from '@/components/DashboardCard';
import { supabase } from '@/integrations/supabase/client';
import { format, isSameDay } from 'date-fns';

const MonthlyCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMonthEvents = async () => {
      if (!date) return;

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('start_time', startOfMonth.toISOString())
          .lte('start_time', endOfMonth.toISOString())
          .order('start_time', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching monthly events:', error);
      }
    };

    fetchMonthEvents();
  }, [date]);

  // Create a map of dates with events for highlighting
  const eventDates = events.reduce((acc: Record<string, number>, event) => {
    const eventDate = format(new Date(event.start_time), 'yyyy-MM-dd');
    if (acc[eventDate]) {
      acc[eventDate] += 1;
    } else {
      acc[eventDate] = 1;
    }
    return acc;
  }, {});

  // Custom day render to show event indicators
  const renderDay = (day: Date) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    const hasEvents = eventDates[formattedDate] > 0;
    
    return (
      <div className="relative w-full h-full">
        <div>{day.getDate()}</div>
        {hasEvents && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="w-1 h-1 rounded-full bg-primary"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardCard 
      title="월간 일정" 
      action={<Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>더보기</Button>}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ko}
            className="rounded-md border w-full"
            modifiersClassNames={{
              today: 'bg-muted text-foreground',
              selected: 'bg-primary text-primary-foreground'
            }}
          />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium mb-4">
            {date && format(date, 'yyyy년 MM월 dd일')}의 일정
          </h3>
          
          <div className="space-y-3">
            {events.filter(event => date && isSameDay(new Date(event.start_time), date)).length > 0 ? (
              events
                .filter(event => date && isSameDay(new Date(event.start_time), date))
                .map(event => (
                  <div 
                    key={event.id} 
                    className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/calendar?event=${event.id}`)}
                  >
                    <h4 className="font-medium line-clamp-1">{event.title}</h4>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <span className="mr-2">🕒</span>
                      <span>{format(new Date(event.start_time), 'HH:mm')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span className="mr-2">📍</span>
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                해당 날짜에 일정이 없습니다.
              </div>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4" 
            onClick={() => navigate('/calendar')}
          >
            모든 일정 보기
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
};

export default MonthlyCalendar;
