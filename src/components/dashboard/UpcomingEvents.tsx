
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

type Event = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  type: string;
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("calendar_events")
          .select("id, title, start_time, end_time, location, type")
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          .limit(3);
        
        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  const formatEventDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "yyyy-MM-dd HH:mm");
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };
  
  const getEventTypeEmoji = (type: string) => {
    const types: Record<string, string> = {
      meeting: "👥",
      training: "📚",
      event: "🎉",
      volunteer: "🤝",
      other: "📌"
    };
    return types[type] || "📅";
  };
  
  return (
    <DashboardCard 
      title="다가오는 일정" 
      action={<Button variant="ghost" size="sm" onClick={() => navigate("/calendar")}>달력 보기</Button>}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          예정된 일정이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map(event => (
            <div key={event.id} className="p-4 border border-border rounded-md">
              <h4 className="font-medium mb-2">{event.title}</h4>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="mr-2">🕒</span>
                  <span>{formatEventDate(event.start_time)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="mr-2">📍</span>
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="mr-2">{getEventTypeEmoji(event.type)}</span>
                  <span>{event.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
};

export default UpcomingEvents;
