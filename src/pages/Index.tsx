
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardCard from "@/components/DashboardCard";
import NoticeCard from "@/components/NoticeCard";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { FileIcon, Upload } from "lucide-react";

type Notice = {
  id: string;
  title: string;
  author: string;
  category?: string;
  created_at: string;
  views: number;
};

type Document = {
  id: string;
  title: string;
  file_type: string;
  created_at: string;
};

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // 가상 데이터
  const events = [
    { id: 1, title: "직원 회의", date: "2023-07-18 14:00", location: "회의실 A" },
    { id: 2, title: "봉사자 교육", date: "2023-07-20 10:00", location: "교육장" },
    { id: 3, title: "후원자 간담회", date: "2023-07-25 18:00", location: "세미나실" },
  ];

  useEffect(() => {
    fetchRecentNotices();
    fetchRecentDocuments();
  }, []);

  const fetchRecentNotices = async () => {
    try {
      setLoadingNotices(true);
      const { data, error } = await supabase
        .from('notices')
        .select('id, title, author, category, created_at, views')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        throw error;
      }

      setRecentNotices(data || []);
    } catch (error) {
      console.error('최근 공지사항을 가져오는 중 오류가 발생했습니다:', error);
      toast({
        title: "데이터 로드 실패",
        description: "최근 공지사항을 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoadingNotices(false);
    }
  };

  const fetchRecentDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, file_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        throw error;
      }

      setRecentDocuments(data || []);
    } catch (error) {
      console.error('최근 자료를 가져오는 중 오류가 발생했습니다:', error);
      toast({
        title: "데이터 로드 실패",
        description: "최근 자료를 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoadingDocuments(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };

  const isNew = (dateString: string) => {
    try {
      return isAfter(new Date(dateString), subDays(new Date(), 3));
    } catch (error) {
      return false;
    }
  };

  // Get current user information
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    fetchUser();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">
              안녕하세요, {user?.user_metadata?.name || user?.email?.split('@')[0] || '방문자'}님!
            </h1>
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
              action={
                <Button variant="ghost" size="sm" onClick={() => navigate('/notices')}>
                  더보기
                </Button>
              }
            >
              {loadingNotices ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : recentNotices.length > 0 ? (
                <div className="space-y-0">
                  {recentNotices.map(notice => (
                    <div key={notice.id} onClick={() => navigate(`/notices/${notice.id}`)}>
                      <NoticeCard
                        title={notice.title}
                        date={formatDate(notice.created_at)}
                        author={notice.author} // Display author name from DB
                        isNew={isNew(notice.created_at)}
                        category={notice.category}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  공지사항이 없습니다.
                </div>
              )}
            </DashboardCard>
            
            <DashboardCard 
              title="자료실" 
              action={<Button variant="ghost" size="sm" onClick={() => navigate('/documents')}>더보기</Button>}
            >
              {loadingDocuments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : recentDocuments.length > 0 ? (
                <div className="space-y-3">
                  {recentDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{doc.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/documents')}>
                    <Upload className="h-4 w-4 mr-2" /> 파일 업로드
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  등록된 자료가 없습니다.
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/documents')}>
                      <Upload className="h-4 w-4 mr-2" /> 파일 업로드
                    </Button>
                  </div>
                </div>
              )}
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
