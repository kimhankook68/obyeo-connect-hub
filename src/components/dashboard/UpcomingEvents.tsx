import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/DashboardCard";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Member } from "@/types/member";

type FreePost = {
  id: string;
  title: string;
  created_at: string;
  author: string;
  views: number;
  user_id?: string | null;
  category?: string;
};

const UpcomingEvents = () => {
  const [posts, setPosts] = useState<FreePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Record<string, Member>>({});
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("free_posts")
          .select("id, title, created_at, author, views, user_id, category")
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (error) {
          console.error("Error fetching posts:", error);
          throw error;
        }
        
        setPosts(data || []);
        
        // Collect unique user IDs to fetch member data
        const userIds = data
          ?.map(post => post.user_id)
          .filter(id => id !== null && id !== undefined) as string[];
        
        if (userIds && userIds.length > 0) {
          const uniqueUserIds = [...new Set(userIds)];
          const { data: membersData } = await supabase
            .from("members")
            .select("*")
            .in("user_id", uniqueUserIds);
            
          if (membersData) {
            const membersMap = membersData.reduce((acc, member) => {
              if (member.user_id) {
                acc[member.user_id] = member;
              }
              return acc;
            }, {} as Record<string, Member>);
            setMembers(membersMap);
          }
        }
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

  const getAuthorDisplayName = (post: FreePost) => {
    // If we have member data for this user_id, use the member's name
    if (post.user_id && members[post.user_id]) {
      return members[post.user_id].name || "사용자";
    }
    
    // For older posts that might not have been created with proper author name
    // Or if the author's profile couldn't be found
    if (post.author.includes('@')) {
      return post.author.split('@')[0];
    }
    
    return post.author;
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    
    let badgeClass = "";
    
    switch (category) {
      case "질문":
        badgeClass = "bg-blue-100 text-blue-800";
        break;
      case "칭찬":
        badgeClass = "bg-green-100 text-green-800";
        break;
      case "건의":
        badgeClass = "bg-orange-100 text-orange-800";
        break;
      case "요청":
        badgeClass = "bg-purple-100 text-purple-800";
        break;
      default:
        badgeClass = "bg-gray-100 text-gray-800";
    }
    
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded-sm mr-1.5 ${badgeClass}`}>
        {category}
      </span>
    );
  };
  
  return (
    <DashboardCard 
      title="자유게시판" 
      action={<Button variant="ghost" size="sm" onClick={() => navigate("/freeboards")}>더보기</Button>}
      className="shadow-sm"
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
        <div className="divide-y">
          {posts.map(post => (
            <div 
              key={post.id} 
              className="py-3 flex justify-between cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => navigate(`/freeboards/${post.id}`)}
            >
              <div className="hover:text-primary truncate max-w-[70%]">
                <p className="flex items-center">
                  {getCategoryBadge(post.category)}
                  <span className="truncate">{post.title}</span>
                  {(new Date().getTime() - new Date(post.created_at).getTime()) < 86400000 && (
                    <Badge variant="secondary" className="ml-1 bg-red-500 text-white text-xs h-4 w-4 rounded-full p-0 flex items-center justify-center">
                      N
                    </Badge>
                  )}
                </p>
              </div>
              <div className="text-xs text-muted-foreground flex-shrink-0 flex items-center space-x-2">
                <span>{getAuthorDisplayName(post)}</span>
                <span>•</span>
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
