
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface Notice {
  id: string;
  title: string;
  created_at: string;
  author: string;
}

const RecentNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data, error } = await supabase
          .from("notices")
          .select("id, title, created_at, author")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setNotices(data || []);
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: ko,
      });
    } catch (error) {
      return "날짜 오류";
    }
  };

  const renderNoticeTitle = (notice: Notice) => {
    // Check if the notice is new (less than 24 hours old)
    const badge = isNewNotice(notice.created_at) ? (
      <Badge variant="secondary" className="ml-2">
        N
      </Badge>
    ) : null;

    return (
      <div className="flex items-center">
        <span className="truncate">{notice.title}</span>
        {badge}
      </div>
    );
  };

  const isNewNotice = (dateStr: string) => {
    const noticeDate = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now.getTime() - noticeDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">최근 공지사항</CardTitle>
          <Link to="/notices" className="text-xs text-muted-foreground hover:underline">
            모두 보기
          </Link>
        </div>
      </CardHeader>
      <CardContent className="divide-y">
        {loading ? (
          <>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="py-3 flex justify-between items-center">
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="h-4 w-[20%]" />
              </div>
            ))}
          </>
        ) : notices.length > 0 ? (
          notices.map((notice) => (
            <div key={notice.id} className="py-3 flex justify-between items-center">
              <Link to={`/notices/${notice.id}`} className="hover:text-primary truncate max-w-[70%]">
                {renderNoticeTitle(notice)}
              </Link>
              <div className="text-xs text-muted-foreground flex-shrink-0 flex items-center space-x-2">
                <span>{notice.author}</span>
                <span>•</span>
                <span>{formatDate(notice.created_at)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            공지사항이 없습니다
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentNotices;
