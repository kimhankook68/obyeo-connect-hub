
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardCard from "@/components/DashboardCard";
import NoticeCard from "@/components/NoticeCard";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // 가상 데이터
  const notices = [
    { 
      id: 1, 
      title: "2023년 하반기 복지사업 계획 안내", 
      date: "2023-07-15", 
      author: "관리자", 
      isNew: true, 
      isPinned: true,
      category: "공지"
    },
    { 
      id: 2, 
      title: "7월 봉사활동 참가자 모집", 
      date: "2023-07-10", 
      author: "봉사팀", 
      isNew: true,
      category: "모집"
    },
    { 
      id: 3, 
      title: "사무실 이전 안내", 
      date: "2023-07-05", 
      author: "행정팀"
    },
    { 
      id: 4, 
      title: "여름 캠프 프로그램 안내", 
      date: "2023-07-01", 
      author: "프로그램팀",
      category: "행사"
    },
  ];

  const tasks = [
    { id: 1, title: "2023년 3분기 예산안 검토", status: "진행중", dueDate: "2023-07-20" },
    { id: 2, title: "후원자 감사 이메일 발송", status: "완료", dueDate: "2023-07-10" },
    { id: 3, title: "여름 캠프 준비물 확인", status: "예정", dueDate: "2023-07-25" },
    { id: 4, title: "홈페이지 콘텐츠 업데이트", status: "지연", dueDate: "2023-07-05" },
  ];

  const events = [
    { id: 1, title: "직원 회의", date: "2023-07-18 14:00", location: "회의실 A" },
    { id: 2, title: "봉사자 교육", date: "2023-07-20 10:00", location: "교육장" },
    { id: 3, title: "후원자 간담회", date: "2023-07-25 18:00", location: "세미나실" },
  ];

  // 상태에 따른 배지 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "진행중":
        return "bg-blue-100 text-blue-800";
      case "완료":
        return "bg-green-100 text-green-800";
      case "예정":
        return "bg-purple-100 text-purple-800";
      case "지연":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">안녕하세요, 길현호님!</h1>
            <p className="text-muted-foreground">오늘도 좋은 하루 되세요.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-6 rounded-lg border border-border bg-card shadow-sm flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">📬</div>
              <div className="text-2xl font-medium">12</div>
              <div className="text-sm text-muted-foreground">새 메시지</div>
            </div>
            
            <div className="p-6 rounded-lg border border-border bg-card shadow-sm flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">✅</div>
              <div className="text-2xl font-medium">5</div>
              <div className="text-sm text-muted-foreground">진행중인 업무</div>
            </div>
            
            <div className="p-6 rounded-lg border border-border bg-card shadow-sm flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">📅</div>
              <div className="text-2xl font-medium">3</div>
              <div className="text-sm text-muted-foreground">오늘의 일정</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DashboardCard 
              title="공지사항" 
              action={<Button variant="ghost" size="sm">더보기</Button>}
            >
              <div className="space-y-0">
                {notices.map(notice => (
                  <NoticeCard
                    key={notice.id}
                    title={notice.title}
                    date={notice.date}
                    author={notice.author}
                    isNew={notice.isNew}
                    isPinned={notice.isPinned}
                    category={notice.category}
                  />
                ))}
              </div>
            </DashboardCard>
            
            <DashboardCard 
              title="내 업무" 
              action={<Button variant="ghost" size="sm">더보기</Button>}
            >
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border border-border">
                        {task.status === "완료" ? "✓" : ""}
                      </div>
                      <span>{task.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
          
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
        </main>
      </div>
    </div>
  );
};

export default Index;
