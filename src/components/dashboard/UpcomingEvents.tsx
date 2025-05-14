
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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
      title="자유게시판" 
      action={<Button variant="ghost" size="sm" onClick={() => navigate("/freeboards")}>더보기</Button>}
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
        <div className="divide-y divide-gray-100">
          {posts.map(post => (
            <div 
              key={post.id} 
              className="flex items-center py-3 cursor-pointer hover:bg-muted/20 transition-colors px-2"
              onClick={() => navigate(`/freeboards/${post.id}`)}
            >
              <div className="flex-shrink-0 w-8 text-xs text-gray-500 text-center">
                <Badge variant="outline" className="bg-gray-50">공지</Badge>
              </div>
              <div className="flex-grow ml-2">
                <p className="font-medium text-sm line-clamp-1">
                  {post.title}
                  {(new Date().getTime() - new Date(post.created_at).getTime()) < 86400000 && (
                    <Badge variant="secondary" className="ml-2 bg-red-500 text-white text-xs h-4 w-4 rounded-full p-0 flex items-center justify-center">
                      N
                    </Badge>
                  )}
                </p>
              </div>
              <div className="flex-shrink-0 text-xs text-gray-500 ml-2">
                {post.author.split('@')[0]}
              </div>
              <div className="flex-shrink-0 text-xs text-gray-500 ml-4">
                {formatPostDate(post.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
};

export default UpcomingEvents;
