
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import NoticeCard from "@/components/NoticeCard";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type Notice = {
  id: string;
  title: string;
  author: string;
  category?: string;
  created_at: string;
  views: number;
};

const RecentNotices = () => {
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchRecentNotices();
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
  
  return (
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
                author={notice.author}
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
  );
};

export default RecentNotices;
