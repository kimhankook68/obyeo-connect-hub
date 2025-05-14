
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  CalendarEvent, 
  CalendarEventFormData,
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from "@/api/calendarApi";
import { formatEventDate } from "@/utils/dateUtils";

export type { CalendarEvent, CalendarEventFormData };

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

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch all calendar events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchCalendarEvents();
      setEvents(data);
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
      // Associate event with current user if logged in
      const dataWithUserId = user ? { ...eventData, user_id: user.id } : eventData;
      
      const data = await createCalendarEvent(dataWithUserId);
      toast.success("일정이 추가되었습니다");
      setEvents(prev => [...prev, data]);
      setModalOpen(false);
      return data;
    } catch (error: any) {
      toast.error("일정 추가 실패");
      return null;
    }
  };

  // Update an existing event
  const updateEvent = async (id: string, eventData: Partial<CalendarEventFormData>) => {
    try {
      const updatedEvent = await updateCalendarEvent(id, eventData);
      
      // 로컬 상태 업데이트
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      toast.success("일정이 수정되었습니다");
      setSelectedEvent(null);
      setModalOpen(false);
      
      return updatedEvent;
    } catch (error: any) {
      toast.error("일정 수정 실패");
      return null;
    }
  };

  // Delete an event
  const deleteEvent = async (id: string) => {
    try {
      await deleteCalendarEvent(id);
      
      // 로컬 상태에서 제거
      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success("일정이 삭제되었습니다");
      setSelectedEvent(null);
      setDeleteDialogOpen(false);
      
    } catch (error: any) {
      toast.error("일정 삭제 실패");
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
