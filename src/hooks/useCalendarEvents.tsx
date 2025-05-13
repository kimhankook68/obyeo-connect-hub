
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
      console.log("Fetching events from database");
      
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) {
        throw error;
      }

      console.log("Fetched events:", data);
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

      console.log("Event created successfully:", data);
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
      
      // 업데이트할 데이터 준비 - null 값 처리 추가
      const updateData = {
        title: eventData.title,
        description: eventData.description === "" ? null : eventData.description,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        location: eventData.location === "" ? null : eventData.location,
        type: eventData.type
      };
      
      // 모든 필드가 유효한지 확인
      if (!updateData.title || !updateData.start_time || !updateData.end_time || !updateData.type) {
        console.error("Invalid update data:", updateData);
        throw new Error("필수 필드가 누락되었습니다");
      }
      
      console.log("Sending update request with data:", updateData);
      
      // 업데이트 요청 전송 - maybeSingle 대신 select만 사용
      const { data, error } = await supabase
        .from("calendar_events")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating event:", error);
        throw error;
      }
      
      // 데이터가 비어있는지 확인
      if (!data || data.length === 0) {
        console.error("No data returned after update");
        throw new Error("업데이트된 데이터를 찾을 수 없습니다");
      }
      
      const updatedEvent = data[0];
      console.log("Event updated successfully:", updatedEvent);

      // 로컬 상태 업데이트
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      toast.success("일정이 수정되었습니다");
      setSelectedEvent(null);
      setModalOpen(false);
      
      // 업데이트 후 데이터 다시 불러오기
      fetchEvents();
      
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
      
      // ID 유효성 검사
      if (!id) {
        throw new Error("유효하지 않은 이벤트 ID");
      }
      
      // 삭제 요청 전송 - 성공 여부만 확인
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting event:", error);
        throw error;
      }
      
      console.log("Event deleted successfully with ID:", id);

      // 로컬 상태에서 제거
      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success("일정이 삭제되었습니다");
      setSelectedEvent(null);
      setDeleteDialogOpen(false);
      
      // 삭제 후 데이터 다시 불러오기
      fetchEvents();
    } catch (error: any) {
      console.error("Error deleting event:", error.message);
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
