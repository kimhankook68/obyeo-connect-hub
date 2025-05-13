
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  type: string;
  user_id?: string;
  created_at: string;
}

export type CalendarEventFormData = Omit<CalendarEvent, "id" | "created_at" | "user_id">;

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast: uiToast } = useToast();
  const [user, setUser] = useState<any>(null);

  // Fetch the current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();
  }, []);

  // Fetch all calendar events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) {
        throw error;
      }

      setEvents(data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error.message);
      uiToast({
        title: "이벤트 로딩 실패",
        description: "일정을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new event
  const createEvent = async (eventData: CalendarEventFormData) => {
    try {
      console.log("Creating event with data:", eventData);
      
      const newEvent = {
        title: eventData.title,
        description: eventData.description || null,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        location: eventData.location || null,
        type: eventData.type
      };
      
      const { data, error } = await supabase
        .from("calendar_events")
        .insert(newEvent)
        .select()
        .single();

      if (error) {
        console.error("Error creating event:", error);
        throw error;
      }

      toast.success("일정이 추가되었습니다");
      setEvents(prev => [...prev, data]);
      setModalOpen(false);
      return data;
    } catch (error: any) {
      console.error("Error creating event:", error.message);
      toast.error("일정 추가 실패");
      return null;
    }
  };

  // Update an existing event
  const updateEvent = async (id: string, eventData: Partial<CalendarEventFormData>) => {
    try {
      console.log("Updating event with ID:", id, "and data:", eventData);
      
      // 1. 업데이트 요청 전송
      const { error: updateError } = await supabase
        .from("calendar_events")
        .update({
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          location: eventData.location,
          type: eventData.type
        })
        .eq("id", id);

      if (updateError) {
        console.error("Error updating event:", updateError);
        throw updateError;
      }

      // 2. 업데이트된 데이터 조회
      const { data: updatedEvent, error: fetchError } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("id", id)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error fetching updated event:", fetchError);
        throw fetchError;
      }

      if (!updatedEvent) {
        console.warn("Updated event not found, refreshing all events");
        await fetchEvents(); // 모든 이벤트를 다시 로드
      } else {
        // 이벤트가 정상적으로 업데이트된 경우
        setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      }

      toast.success("일정이 수정되었습니다");
      setSelectedEvent(null);
      setModalOpen(false);
      return updatedEvent;
    } catch (error: any) {
      console.error("Error updating event:", error.message);
      toast.error("일정 수정 실패");
      return null;
    }
  };

  // Delete an event
  const deleteEvent = async (id: string) => {
    try {
      console.log("Deleting event with ID:", id);
      
      // 1. 삭제 요청 전송
      const { error: deleteError } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Error deleting event:", deleteError);
        throw deleteError;
      }

      // 2. 성공적으로 삭제된 경우 로컬 상태 업데이트
      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success("일정이 삭제되었습니다");
      setSelectedEvent(null);
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting event:", error.message);
      toast.error("일정 삭제 실패");
      // 삭제 실패 시 현재 상태 다시 로드
      fetchEvents();
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    console.log("Editing event:", event);
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleDelete = (event: CalendarEvent) => {
    console.log("Delete requested for event:", event);
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    console.log("Adding new event");
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "yyyy-MM-dd HH:mm");
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Initialize by loading events
  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    selectedEvent,
    modalOpen,
    setModalOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    user,
    handleAdd,
    handleEdit,
    handleDelete,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    formatEventDate
  };
};
