
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardCard } from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { MessageSquare, Heart, Share2, Bell, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserPost } from "@/types/member";

const NewsFeed = () => {
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Fetch user posts with better error handling
      let posts: UserPost[] = [];
      try {
        // Cast the raw response to any first to bypass type checking
        const response: any = await supabase
          .from("user_posts" as any)
          .select("id, content, created_at, user_id, author_name")
          .order("created_at", { ascending: false })
          .limit(10);
        
        // Check if response has data and no error
        if (response && response.data && !response.error) {
          // Map each item in the array to ensure it has the right structure
          posts = response.data.map((post: any) => ({
            id: post.id,
            content: post.content,
            created_at: post.created_at,
            author_name: post.author_name,
            user_id: post.user_id
          }));
          setUserPosts(posts);
        } else if (response.error) {
          console.error("Error fetching user posts:", response.error);
        }
      } catch (postFetchError) {
        console.error("Error processing user posts:", postFetchError);
      }
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
    fetchPosts();
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
      fetchPosts();
      
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
      ) : userPosts.length > 0 ? (
        <div className="space-y-6">
          {userPosts.map((post) => (
            <div key={post.id} className="flex gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={undefined} />
                <AvatarFallback>
                  {post.author_name?.substring(0, 2) || "사용자"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{post.author_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(post.created_at)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.content}
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <Heart className="h-4 w-4" /> {Math.floor(Math.random() * 15)}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <MessageSquare className="h-4 w-4" /> {Math.floor(Math.random() * 7)}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-auto">
                    <Share2 className="h-4 w-4" /> 공유
                  </button>
                </div>
              </div>
            </div>
          ))}
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
