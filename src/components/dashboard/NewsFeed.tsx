
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardCard } from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { MessageSquare, Heart, Share2, Bell, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserPost } from "@/types/member";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author?: {
    name: string;
    avatar?: string;
  };
  type: 'notice' | 'document' | 'event' | 'news' | 'post';
  created_at: string;
  likes?: number;
  comments?: number;
}

const NewsFeed = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const { toast } = useToast();

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
        .select("id, title, description, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(2);

      if (documentError) throw documentError;

      // Fetch calendar events
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const { data: events, error: eventError } = await supabase
        .from("calendar_events")
        .select("id, title, description, start_time, user_id")
        .gte("start_time", today.toISOString())
        .lte("start_time", nextWeek.toISOString())
        .order("start_time", { ascending: true })
        .limit(2);

      if (eventError) throw eventError;

      // Fetch user posts with better error handling
      let userPosts: UserPost[] = [];
      try {
        // Cast the raw response to any first to bypass type checking
        const response: any = await supabase
          .from("user_posts" as any)
          .select("id, content, created_at, user_id, author_name")
          .order("created_at", { ascending: false })
          .limit(5);
        
        // Check if response has data and no error
        if (response && response.data && !response.error) {
          // Map each item in the array to ensure it has the right structure
          userPosts = response.data.map((post: any) => ({
            id: post.id,
            content: post.content,
            created_at: post.created_at,
            author_name: post.author_name,
            user_id: post.user_id
          }));
        } else if (response.error) {
          console.error("Error fetching user posts:", response.error);
        }
      } catch (postFetchError) {
        console.error("Error processing user posts:", postFetchError);
        // Continue with empty posts array
      }

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
        created_at: event.start_time,
        author: { name: "일정담당자" },
        likes: Math.floor(Math.random() * 5),
        comments: Math.floor(Math.random() * 2)
      })) || [];

      // Process posts with the validated array
      const processedPosts = userPosts.map(post => ({
        id: post.id,
        title: "", // Posts don't have titles
        content: post.content,
        type: 'post' as const,
        created_at: post.created_at,
        author: { name: post.author_name || "사용자" },
        likes: Math.floor(Math.random() * 15),
        comments: Math.floor(Math.random() * 7)
      })) || [];

      // Combine all items and sort by created_at
      const allItems = [...processedPosts, ...processedNotices, ...processedDocs, ...processedEvents]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNewsItems(allItems.slice(0, 10));
    } catch (error) {
      console.error("Error fetching news feed data:", error);
      toast({
        title: "데이터 불러오기 오류",
        description: "뉴스피드 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      case 'post':
        return { variant: 'outline' as const, text: '짧은 소식' };
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;

    setPostLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "포스트를 작성하려면 로그인이 필요합니다.",
          variant: "destructive",
        });
        setPostLoading(false);
        return;
      }

      // Get user profile info for name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      const authorName = profileData?.name || user.email?.split('@')[0] || "사용자";

      // Insert new post with better error handling
      const response: any = await supabase
        .from("user_posts" as any)
        .insert({
          content: newPost,
          user_id: user.id,
          author_name: authorName
        });

      if (response.error) throw response.error;

      // Clear input field
      setNewPost("");
      
      // Refresh news feed
      fetchNewsItems();
      
      toast({
        title: "작성 완료",
        description: "새 포스트가 작성되었습니다.",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "포스트 작성 오류",
        description: "포스트를 작성하는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <DashboardCard 
      title="뉴스피드" 
      action={<Button variant="ghost" size="sm">더보기</Button>}
      className="col-span-full"
    >
      {/* Post create section */}
      <div className="mb-6 flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback>사용자</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea 
            placeholder="동료들에게 새로운 소식을 전해보세요."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="resize-none"
            maxLength={300}
          />
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">
              {newPost.length}/300자
            </span>
            <Button 
              size="sm" 
              disabled={!newPost.trim() || postLoading}
              onClick={handlePostSubmit}
            >
              {postLoading ? "작성 중..." : "작성하기"} <Send className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
                    {item.title && (
                      <h4 className="font-medium">{item.title}</h4>
                    )}
                    {item.content && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
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
