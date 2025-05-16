import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { supabase } from "@/integrations/supabase/client";
import CalendarView from "@/components/calendar/CalendarView";
import EventForm from "@/components/calendar/EventForm";
import DeleteEventDialog from "@/components/calendar/DeleteEventDialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { parseISO, format } from "date-fns";

const Calendar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [user, setUser] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    events,
    loading,
    selectedEvent,
    selectedDate,
    setSelectedDate,
    modalOpen,
    setModalOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleAdd,
    handleEdit,
    handleDelete,
    createEvent,
    updateEvent,
    deleteEvent,
    getSelectedDateEvents,
    formatEventDate,
    viewOnlyMode
  } = useCalendarEvents();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();
  }, []);

  // URL 파라미터에서 날짜 확인
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const eventParam = searchParams.get('event');
    
    if (dateParam) {
      try {
        const parsedDate = parseISO(dateParam);
        setSelectedDate(parsedDate);
      } catch (error) {
        console.error('유효하지 않은 날짜 형식:', error);
      }
    }
    
    if (eventParam && events.length > 0) {
      const event = events.find(e => e.id === eventParam);
      if (event) {
        handleEdit(event);
        // 해당 이벤트의 날짜도 선택
        setSelectedDate(parseISO(event.start_time));
      }
    }
  }, [searchParams, events, setSelectedDate, handleEdit]);

  // location state에서 오는 모달 열기 요청 및 선택된 날짜 처리
  useEffect(() => {
    const state = location.state as any;
    
    if (state?.openEventModal) {
      // 선택된 날짜가 있으면 해당 날짜로 설정
      if (state.selectedDate) {
        try {
          const parsedDate = parseISO(state.selectedDate);
          setSelectedDate(parsedDate);
        } catch (error) {
          console.error('유효하지 않은 날짜 형식:', error);
        }
      }
      
      handleAdd();
      // 상태 정리 - 이렇게 해야 모달을 닫았다가 다시 열 때 제대로 작동함
      window.history.replaceState({}, document.title);
    }
  }, [location.state, handleAdd, setSelectedDate]);

  // 모달 닫을 때 URL 상태 정리
  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    // 모달이 닫히면 URL 상태 정리
    if (!open) {
      // URL 상태를 유지하되, navigate 사용 시 replace 옵션 사용
      navigate('/calendar', { replace: true });
    }
  };

  // 특정 날짜에 일정 추가 핸들러
  const handleAddEventOnDay = (day: Date) => {
    if (isUserLoggedIn) {
      setSelectedDate(day);
      handleAdd();
    }
  };

  const getEventCountForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    }).length;
  };

  const isUserLoggedIn = !!user;

  return (
    <div className="flex h-screen bg-muted/5">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="일정 관리" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">일정 관리</h1>
              
              {/* 뷰 모드 선택 버튼 추가 */}
              <div className="flex gap-2 items-center">
                <div className="hidden md:flex items-center space-x-2">
                  <Button 
                    variant={viewMode === "month" ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("month")}
                  >
                    월간
                  </Button>
                  <Button 
                    variant={viewMode === "week" ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("week")}
                  >
                    주간
                  </Button>
                  <Button 
                    variant={viewMode === "day" ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("day")}
                  >
                    일간
                  </Button>
                </div>
                
                {isUserLoggedIn && (
                  <Button 
                    onClick={handleAdd} 
                    className="hidden md:inline-flex"
                  >
                    <Plus className="mr-1 h-4 w-4" /> 새 일정
                  </Button>
                )}
              </div>
            </div>
            
            {/* 달력 뷰 */}
            <Card className="overflow-hidden shadow-sm mb-6 flex-grow">
              {loading ? (
                <div className="p-4 space-y-4 h-full">
                  <Skeleton className="h-[40px] w-full" />
                  <div className="grid grid-cols-7 gap-2">
                    {Array(7).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-[40px]" />
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 h-full">
                    {Array(35).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-[80px]" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 h-full">
                  <CalendarView 
                    viewMode={viewMode} 
                    events={events} 
                    loading={loading}
                    date={selectedDate} 
                    setDate={setSelectedDate}
                    getEventCountForDay={getEventCountForDay}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    formatEventDate={formatEventDate}
                    isUserLoggedIn={isUserLoggedIn}
                    handleAddEvent={handleAddEventOnDay}
                  />
                </div>
              )}
            </Card>
            
            {/* 모바일용 버튼 */}
            {isUserLoggedIn && (
              <div className="fixed bottom-6 right-6 md:hidden">
                <Button 
                  size="icon" 
                  onClick={handleAdd} 
                  className="h-12 w-12 rounded-full shadow-lg"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            )}

            {/* 일정 폼 다이얼로그 */}
            <EventForm 
              open={modalOpen} 
              onOpenChange={handleModalClose}
              selectedEvent={selectedEvent}
              createEvent={createEvent}
              updateEvent={updateEvent}
            />
            
            {/* 삭제 확인 다이얼로그 */}
            <DeleteEventDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onConfirm={() => deleteEvent(selectedEvent?.id || '')}
              event={selectedEvent}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Calendar;
