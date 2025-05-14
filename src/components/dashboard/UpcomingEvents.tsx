
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

type FreePost = {
  id: string;
  title: string;
  created_at: string;
  author: string;
  views: number;
};

const UpcomingEvents = () => {
  const [posts, setPosts] = useState<FreePost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("free_posts")
          .select("id, title, created_at, author, views")
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  const formatPostDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "yyyy-MM-dd");
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };
  
  return (
    <DashboardCard 
      title="최근 게시물" 
      action={<Button variant="ghost" size="sm" onClick={() => navigate("/boards")}>모두 보기</Button>}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          최근 게시물이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div 
              key={post.id} 
              className="p-4 border border-border rounded-md cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/boards/${post.id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{post.title}</h4>
                <span className="text-xs text-muted-foreground">조회 {post.views}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{post.author}</span>
                <span>{formatPostDate(post.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
};

export default UpcomingEvents;
