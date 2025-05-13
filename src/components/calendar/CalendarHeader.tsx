
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalendarHeaderProps {
  onAddEvent: () => void;
  view: "calendar" | "list";
  onViewChange: (view: "calendar" | "list") => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  onAddEvent, 
  view, 
  onViewChange 
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">일정 관리</h1>
        <Button onClick={onAddEvent}>새 일정 추가</Button>
      </div>
      
      <Tabs value={view} onValueChange={(value) => onViewChange(value as "calendar" | "list")}>
        <TabsList className="mb-4">
          <TabsTrigger value="calendar">캘린더</TabsTrigger>
          <TabsTrigger value="list">목록</TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
};

export default CalendarHeader;
