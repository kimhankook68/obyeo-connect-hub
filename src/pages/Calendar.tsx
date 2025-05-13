
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
    createEvent(data);
  };

  const handleUpdateEvent = (data: any) => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, data);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
    }
  };

  const handleViewChange = (newView: "calendar" | "list") => {
    setView(newView);
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <CalendarHeader 
            onAddEvent={handleAdd} 
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
