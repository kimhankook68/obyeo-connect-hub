
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
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  
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
    fetchEvents,
    formatEventDate
  } = useCalendarEvents();

  const handleCreateEvent = (data: any) => {
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
    if (selectedEvent) {
      // 업데이트된 데이터 전송
      const updatedData = {
        title: data.title,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time, 
        location: data.location,
        type: data.type
      };
      
      updateEvent(selectedEvent.id, updatedData);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
    } else {
      console.error("Cannot delete: No event selected");
    }
  };

  const handleViewChange = (newView: "calendar" | "list") => {
    setView(newView);
  };

  // 보기 모드 변경 핸들러 (월간, 주간, 일간)
  const handleViewModeChange = (newMode: "month" | "week" | "day") => {
    setViewMode(newMode);
  };

  // 일정 추가 버튼 클릭 핸들러
  const handleAddEvent = () => {
    handleAdd();
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="일정 관리" />
        
        <main className="flex-1 flex flex-col overflow-hidden p-6 bg-background relative">
          <CalendarHeader 
            onAddEvent={handleAddEvent} 
            view={view} 
            onViewChange={handleViewChange}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs value={view} onValueChange={(value) => handleViewChange(value as "calendar" | "list")} className="h-full flex-1 flex flex-col">
              <TabsContent value="calendar" className="h-full flex-1 overflow-auto flex flex-col">
                <CalendarView 
                  date={date}
                  setDate={setDate}
                  events={events}
                  loading={loading}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  formatEventDate={formatEventDate}
                  isUserLoggedIn={!!user}
                  viewMode={viewMode}
                />
              </TabsContent>
              
              <TabsContent value="list" className="h-full flex-1 overflow-auto">
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
          </div>
          
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
          
          {/* 저작권 메시지 추가 */}
          <div className="w-full text-center py-3 text-xs text-gray-500 border-t mt-4">
            Copyright {new Date().getFullYear()}. 사회복지법인 오병이어복지재단. All rights reserved.
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;
