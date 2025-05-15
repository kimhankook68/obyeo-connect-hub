
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardCard } from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { MessageSquare, Heart, Share2, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author?: {
    name: string;
    avatar?: string;
  };
  type: 'notice' | 'document' | 'event' | 'news';
  created_at: string;
  likes?: number;
  comments?: number;
}

const NewsFeed = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsItems = async () => {
      setLoading(true);
      try {
        // Fetch notices
        const { data: notices, error: noticeError } = await supabase
          .from("notices")
          .select("id, title, content, created_at, user_id")
          .order("created_at", { ascending: false })
          .limit(3);

        if (noticeError) throw noticeError;

        // Fetch the most recent documents
        const { data: documents, error: documentError } = await supabase
          .from("documents")
          .select("id, title, description:content, created_at, user_id")
          .order("created_at", { ascending: false })
          .limit(2);

        if (documentError) throw documentError;

        // Fetch calendar events
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const { data: events, error: eventError } = await supabase
          .from("events")
          .select("id, title, description:content, start_date:created_at, user_id")
          .gte("start_date", today.toISOString())
          .lte("start_date", nextWeek.toISOString())
          .order("start_date", { ascending: true })
          .limit(2);

        if (eventError) throw eventError;

        // Process the data to create the news items array
        const processedNotices = notices?.map(notice => ({
          id: notice.id,
          title: notice.title,
          content: notice.content || "",
          type: 'notice' as const,
          created_at: notice.created_at,
          author: { name: "관리자" },
          likes: Math.floor(Math.random() * 10),
          comments: Math.floor(Math.random() * 5)
        })) || [];

        const processedDocs = documents?.map(doc => ({
          id: doc.id,
          title: doc.title,
          content: doc.description || "",
          type: 'document' as const,
          created_at: doc.created_at,
          author: { name: "자료담당자" },
          likes: Math.floor(Math.random() * 8),
          comments: Math.floor(Math.random() * 3)
        })) || [];

        const processedEvents = events?.map(event => ({
          id: event.id,
          title: event.title,
          content: event.description || "",
          type: 'event' as const,
          created_at: event.start_date,
          author: { name: "일정담당자" },
          likes: Math.floor(Math.random() * 5),
          comments: Math.floor(Math.random() * 2)
        })) || [];

        // Combine all items and sort by created_at
        const allItems = [...processedNotices, ...processedDocs, ...processedEvents]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setNewsItems(allItems.slice(0, 5));
      } catch (error) {
        console.error("Error fetching news feed data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItems();
  }, []);

  // Format date to relative time (e.g., "3 days ago")
  const formatRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: ko,
      });
    } catch (error) {
      return "날짜 오류";
    }
  };

  // Get badge variant and text based on item type
  const getTypeInfo = (type: NewsItem['type']) => {
    switch (type) {
      case 'notice':
        return { variant: 'destructive' as const, text: '공지사항' };
      case 'document':
        return { variant: 'secondary' as const, text: '새 자료' };
      case 'event':
        return { variant: 'default' as const, text: '다가오는 일정' };
      case 'news':
        return { variant: 'outline' as const, text: '소식' };
    }
  };

  return (
    <DashboardCard 
      title="뉴스피드" 
      action={<Button variant="ghost" size="sm">더보기</Button>}
      className="col-span-full"
    >
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : newsItems.length > 0 ? (
        <div className="space-y-6">
          {newsItems.map((item) => {
            const typeInfo = getTypeInfo(item.type);
            
            return (
              <div key={item.id} className="flex gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={item.author?.avatar} />
                  <AvatarFallback>
                    {item.author?.name?.substring(0, 2) || "사용자"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.author?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.created_at)}
                    </span>
                    <Badge variant={typeInfo.variant} className="ml-auto">
                      {typeInfo.text}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    {item.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.content}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <Heart className="h-4 w-4" /> {item.likes}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <MessageSquare className="h-4 w-4" /> {item.comments}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-auto">
                      <Share2 className="h-4 w-4" /> 공유
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <Bell className="h-8 w-8 mb-2 opacity-50" />
          <p>새로운 소식이 없습니다</p>
        </div>
      )}
    </DashboardCard>
  );
};

export default NewsFeed;
