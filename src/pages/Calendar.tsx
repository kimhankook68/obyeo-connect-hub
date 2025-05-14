
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
import EventsGrid from "@/components/calendar/EventsGrid";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

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

  const selectedDateEvents = getSelectedDateEvents();
  
  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="일정 관리" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">일정 관리</h1>
            
            <div className="flex space-x-4">
              {isUserLoggedIn && (
                <Button onClick={handleAdd} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  새 일정
                </Button>
              )}
            </div>
          </div>
          
          <Card className="mb-6">
            <CalendarHeader 
              viewMode={viewMode} 
              setViewMode={setViewMode} 
              date={selectedDate || new Date()} 
              setDate={setSelectedDate}
            />
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
          </Card>
          
          {selectedDate && (
            <div className="mt-6">
              <h2 className="text-xl font-medium mb-4">
                {format(selectedDate, "yyyy년 MM월 dd일", { locale: ko })} 일정 목록
              </h2>
              <EventsGrid
                events={selectedDateEvents}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                formatEventDate={formatEventDate}
                isUserLoggedIn={isUserLoggedIn}
                selectedDate={selectedDate}
              />
            </div>
          )}

          {/* Event form dialog */}
          <EventForm 
            open={modalOpen} 
            onOpenChange={setModalOpen}
            selectedEvent={selectedEvent}
            createEvent={createEvent}
            updateEvent={updateEvent}
          />
          
          {/* Delete event dialog */}
          <DeleteEventDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={() => deleteEvent(selectedEvent?.id || '')}
            event={selectedEvent}
          />
        </main>
      </div>
    </div>
  );
};

export default Calendar;
