
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { supabase } from "@/integrations/supabase/client";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarView from "@/components/calendar/CalendarView";
import EventForm from "@/components/calendar/EventForm";
import DeleteEventDialog from "@/components/calendar/DeleteEventDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Calendar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [user, setUser] = useState<any>(null);
  
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
    formatEventDate
  } = useCalendarEvents();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();
  }, []);

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
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">일정 관리</h1>
              
              {/* Removed the top "새 일정" button */}
            </div>
            
            {/* 달력 헤더 */}
            <CalendarHeader 
              viewMode={viewMode} 
              setViewMode={setViewMode} 
              date={selectedDate} 
              setDate={setSelectedDate}
              handleAddEvent={handleAdd}
              isUserLoggedIn={isUserLoggedIn}
            />
            
            {/* 달력 뷰 */}
            <Card className="overflow-hidden shadow-sm mb-6">
              {loading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-[40px] w-full" />
                  <div className="grid grid-cols-7 gap-2">
                    {Array(7).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-[40px]" />
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array(35).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-[80px]" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4">
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
              onOpenChange={setModalOpen}
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
