
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "../components/ui/use-toast";

const FreeBoards = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("free_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("게시물 가져오기 실패:", error);
      toast({
        title: "게시물 로드 실패",
        description: "게시물 목록을 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="자유게시판" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">자유게시판</h1>
            <Button onClick={() => navigate("/freeboards/create")}>
              <PlusIcon className="h-4 w-4 mr-2" />
              새 글 작성
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground mb-4">아직 게시물이 없습니다.</p>
              <Button onClick={() => navigate("/freeboards/create")}>
                새 글 작성하기
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/freeboards/${post.id}`)}
                >
                  <h2 className="font-medium text-lg mb-1">{post.title}</h2>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>작성자: {post.author}</span>
                    <span>작성일: {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FreeBoards;
