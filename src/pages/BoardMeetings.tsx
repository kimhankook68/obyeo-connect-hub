
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { BoardMeeting } from "@/types/boardMeetings";

const BoardMeetings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: meetings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['boardMeetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('board_meetings' as any)
        .select('*')
        .order('meeting_date', { ascending: false });
      
      if (error) throw error;
      return data as unknown as BoardMeeting[];
    }
  });

  if (error) {
    toast.error("이사회 정보를 불러오는 중 오류가 발생했습니다.");
  }

  const filteredMeetings = meetings.filter(meeting => {
    if (activeTab === 'all') return true;
    return meeting.status === activeTab;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko });
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <Header title="이사회" subtitle="이사회 회의 및 자료를 관리하세요" />
        
        <div className="p-6 flex-1 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">이사회</h2>
            <Button onClick={() => navigate("/board-meetings/create")}>
              새 이사회 등록
            </Button>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="upcoming">예정된 이사회</TabsTrigger>
              <TabsTrigger value="completed">완료된 이사회</TabsTrigger>
              <TabsTrigger value="cancelled">취소된 이사회</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p className="mb-2">등록된 이사회가 없습니다.</p>
              <Button variant="outline" onClick={() => navigate("/board-meetings/create")}>
                이사회 등록하기
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeetings.map((meeting) => (
                <Card 
                  key={meeting.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/board-meetings/${meeting.id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-2">{meeting.title}</CardTitle>
                        <CardDescription>
                          {formatDate(meeting.meeting_date)}
                        </CardDescription>
                      </div>
                      <div>
                        {meeting.status === 'upcoming' && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">예정</span>
                        )}
                        {meeting.status === 'completed' && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">완료</span>
                        )}
                        {meeting.status === 'cancelled' && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">취소</span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-2">
                      {meeting.content || "내용 없음"}
                    </p>
                    {meeting.location && (
                      <p className="text-xs text-muted-foreground mt-2">
                        📍 {meeting.location}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    {formatTimeAgo(meeting.created_at)} 등록
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardMeetings;
