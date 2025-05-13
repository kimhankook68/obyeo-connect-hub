import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventForm from "@/components/calendar/EventForm";
import EventItem from "@/components/calendar/EventItem";
import DeleteEventDialog from "@/components/calendar/DeleteEventDialog";
import { useCalendarEvents, CalendarEventFormData } from "@/hooks/useCalendarEvents";
import { format, parseISO, isSameDay, isEqual } from "date-fns";
import { ko } from "date-fns/locale";

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

  const handleCreateEvent = (data: CalendarEventFormData) => {
    createEvent(data);
  };

  const handleUpdateEvent = (data: CalendarEventFormData) => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, data);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
    }
  };

  // 이벤트가 있는 날짜 계산
  const eventDates = useMemo(() => {
    return events.map(event => {
      const eventDate = parseISO(event.start_time);
      return new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate()
      );
    });
  }, [events]);

  // 특정 날짜에 이벤트가 있는지 확인하는 함수
  const isDayWithEvent = (day: Date) => {
    return eventDates.some(eventDate => 
      isEqual(
        new Date(day.getFullYear(), day.getMonth(), day.getDate()),
        eventDate
      )
    );
  };

  // 날짜에 따른 이벤트 필터링
  const filteredEvents = date
    ? events.filter((event) => {
        const eventStartDate = parseISO(event.start_time);
        return isSameDay(eventStartDate, date);
      })
    : events;

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">일정 관리</h1>
            <Button onClick={handleAdd}>새 일정 추가</Button>
          </div>
          
          <Tabs value={view} onValueChange={(value) => setView(value as "calendar" | "list")}>
            <TabsList className="mb-4">
              <TabsTrigger value="calendar">캘린더</TabsTrigger>
              <TabsTrigger value="list">목록</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2 bg-card p-4 rounded-lg border w-full">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="w-full rounded-md border"
                    locale={ko}
                    modifiers={{
                      event: (date) => isDayWithEvent(date)
                    }}
                    modifiersClassNames={{
                      event: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                    }}
                  />
                </div>
                
                <div className="md:w-1/2">
                  <h2 className="text-lg font-medium mb-4">
                    {date ? format(date, "yyyy년 MM월 dd일", { locale: ko }) : "전체"} 일정
                  </h2>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      해당 날짜에 등록된 일정이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEvents.map((event) => (
                        <EventItem
                          key={event.id}
                          event={event}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          formatEventDate={formatEventDate}
                          isUserLoggedIn={!!user}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    등록된 일정이 없습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map((event) => (
                      <EventItem
                        key={event.id}
                        event={event}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatEventDate={formatEventDate}
                        isUserLoggedIn={!!user}
                      />
                    ))}
                  </div>
                )}
              </div>
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
