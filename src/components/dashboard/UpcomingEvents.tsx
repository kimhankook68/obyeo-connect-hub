
import React from "react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";

type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
};

const UpcomingEvents = () => {
  // 가상 데이터 - 실제 구현에서는 API 또는 상태로 관리
  const events: Event[] = [
    { id: 1, title: "직원 회의", date: "2023-07-18 14:00", location: "회의실 A" },
    { id: 2, title: "봉사자 교육", date: "2023-07-20 10:00", location: "교육장" },
    { id: 3, title: "후원자 간담회", date: "2023-07-25 18:00", location: "세미나실" },
  ];
  
  return (
    <DashboardCard 
      title="다가오는 일정" 
      action={<Button variant="ghost" size="sm">달력 보기</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map(event => (
          <div key={event.id} className="p-4 border border-border rounded-md">
            <h4 className="font-medium mb-2">{event.title}</h4>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="mr-2">🕒</span>
                <span>{event.date}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="mr-2">📍</span>
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default UpcomingEvents;
