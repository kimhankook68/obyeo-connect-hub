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
import { isSameDay, parseISO } from "date-fns";

export type { CalendarEvent, CalendarEventFormData };

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast: uiToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [viewOnlyMode, setViewOnlyMode] = useState(false);

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

  // Get events for selected date
  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    
    return events.filter(event => {
      const eventDate = parseISO(event.start_time);
      return isSameDay(eventDate, selectedDate);
    });
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
      // 권한 확인 (본인이 등록한 일정인지 확인)
      const eventToUpdate = events.find(e => e.id === id);
      
      if (eventToUpdate?.user_id && user?.id !== eventToUpdate.user_id) {
        toast.error("본인이 등록한 일정만 수정할 수 있습니다");
        return null;
      }
      
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
      // 권한 확인 (본인이 등록한 일정인지 확인)
      const eventToDelete = events.find(e => e.id === id);
      
      if (eventToDelete?.user_id && user?.id !== eventToDelete.user_id) {
        toast.error("본인이 등록한 일정만 삭제할 수 있습니다");
        return;
      }
      
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

  // 일정 상세 보기
  const handleViewDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    
    // 본인이 등록한 일정인지 확인 (수정/삭제 권한 확인용)
    const canEdit = !event.user_id || (user?.id === event.user_id);
    
    // 뷰 모드 설정 (수정 가능 여부에 따라)
    setViewOnlyMode(!canEdit);
    
    // 상세 보기 모달 열기
    setDetailsDialogOpen(true);
  };

  // 일정 수정 모드로 전환
  const handleEdit = (event: CalendarEvent) => {
    setSelectedEvent(event);
    
    // 본인이 등록한 일정인지 확인
    const canEdit = !event.user_id || (user?.id === event.user_id);
    
    // 뷰 모드 설정 (수정 가능 여부에 따라)
    setViewOnlyMode(!canEdit);
    
    // 수정 모달 열기
    setDetailsDialogOpen(false);
    setModalOpen(true);
  };

  const handleDelete = (event: CalendarEvent) => {
    // 권한 확인
    if (event.user_id && user?.id !== event.user_id) {
      toast.error("본인이 등록한 일정만 삭제할 수 있습니다");
      return;
    }
    
    console.log("Delete requested for event:", event);
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    console.log("Adding new event");
    setSelectedEvent(null);
    setViewOnlyMode(false);
    setModalOpen(true);
  };

  // 이벤트 권한 체크 (수정/삭제 가능 여부)
  const canManageEvent = (event: CalendarEvent | null): boolean => {
    if (!event || !user) return false;
    return !event.user_id || event.user_id === user.id;
  }

  // Initialize by loading events
  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    selectedEvent,
    selectedDate,
    setSelectedDate,
    modalOpen,
    setModalOpen,
    detailsDialogOpen,
    setDetailsDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    user,
    viewOnlyMode,
    handleAdd,
    handleViewDetails,
    handleEdit,
    handleDelete,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    formatEventDate,
    getSelectedDateEvents,
    canManageEvent
  };
};
