
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import EventForm from "@/components/calendar/EventForm";
import DeleteEventDialog from "@/components/calendar/DeleteEventDialog";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarView from "@/components/calendar/CalendarView";
import ListView from "@/components/calendar/ListView";

const CalendarPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  
  const {
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
    formatEventDate
  } = useCalendarEvents();

  const handleCreateEvent = (data: any) => {
    console.log("handleCreateEvent called with data:", data);
    // 일정 생성 시 현재 선택된 날짜가 있으면 설정
    if (date && !data.start_time) {
      const startDate = new Date(date);
      startDate.setHours(9, 0, 0); // 기본값으로 오전 9시 설정
      data.start_time = startDate.toISOString();
      
      const endDate = new Date(date);
      endDate.setHours(10, 0, 0); // 기본값으로 오전 10시 설정
      data.end_time = endDate.toISOString();
    }
    
    createEvent(data);
  };

  const handleUpdateEvent = (data: any) => {
    console.log("handleUpdateEvent called with data:", data, "and selectedEvent:", selectedEvent);
    if (selectedEvent) {
      // 모든 필드가 전달되도록 수정
      const completeData = {
        title: data.title || selectedEvent.title,
        description: data.description || selectedEvent.description,
        start_time: data.start_time || selectedEvent.start_time,
        end_time: data.end_time || selectedEvent.end_time, 
        location: data.location || selectedEvent.location,
        type: data.type || selectedEvent.type
      };
      updateEvent(selectedEvent.id, completeData);
    }
  };

  const handleDeleteConfirm = () => {
    console.log("handleDeleteConfirm called with selectedEvent:", selectedEvent);
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
    }
  };

  const handleViewChange = (newView: "calendar" | "list") => {
    setView(newView);
  };

  // 일정 추가 버튼 클릭 핸들러
  const handleAddEvent = () => {
    console.log("handleAddEvent called with date:", date);
    handleAdd();
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <CalendarHeader 
            onAddEvent={handleAddEvent} 
            view={view} 
            onViewChange={handleViewChange}
          />
          
          <Tabs value={view} onValueChange={(value) => handleViewChange(value as "calendar" | "list")}>
            <TabsContent value="calendar" className="space-y-4">
              <CalendarView 
                date={date}
                setDate={setDate}
                events={events}
                loading={loading}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                formatEventDate={formatEventDate}
                isUserLoggedIn={!!user}
              />
            </TabsContent>
            
            <TabsContent value="list">
              <ListView 
                events={events}
                loading={loading}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                formatEventDate={formatEventDate}
                isUserLoggedIn={!!user}
              />
            </TabsContent>
          </Tabs>
          
          <EventForm
            open={modalOpen}
            onOpenChange={setModalOpen}
            onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
            event={selectedEvent}
          />
          
          <DeleteEventDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDeleteConfirm}
            event={selectedEvent}
          />
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;
