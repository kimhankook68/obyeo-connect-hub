
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const FreeBoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("free_posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error("게시물 가져오기 실패:", error);
        toast({
          title: "게시물 로드 실패",
          description: "게시물 정보를 불러오는 데 실패했습니다.",
          variant: "destructive",
        });
        navigate("/freeboards");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, navigate, toast]);

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={loading ? "자유게시판" : post?.title} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl">
              <div className="p-6 border rounded-lg">
                <h1 className="text-2xl font-semibold mb-4">{post.title}</h1>
                <div className="flex justify-between text-sm text-muted-foreground mb-6">
                  <span>작성자: {post.author}</span>
                  <span>작성일: {new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>

              <div className="text-center py-8">
                <p className="text-muted-foreground">댓글 기능은 현재 개발 중입니다.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FreeBoardDetail;
