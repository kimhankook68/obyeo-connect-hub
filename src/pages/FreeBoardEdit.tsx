
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FreeBoardEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [originalPost, setOriginalPost] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user role from profiles
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
          
        if (profileData) {
          setUserRole(profileData.role);
        }
      } else {
        toast.error("로그인 필요", {
          description: "게시물을 수정하려면 로그인이 필요합니다."
        });
        navigate("/auth");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("free_posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        // Check if the user has permission to edit this post
        if (data.user_id !== user.id && userRole !== 'admin') {
          toast.error("권한 없음", {
            description: "이 게시물을 수정할 권한이 없습니다."
          });
          navigate("/freeboards");
          return;
        }
        
        setOriginalPost(data);
        setTitle(data.title);
        setContent(data.content);
      } catch (error) {
        console.error("게시물 가져오기 실패:", error);
        toast.error("게시물 로드 실패", {
          description: "게시물 정보를 불러오는 데 실패했습니다."
        });
        navigate("/freeboards");
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchPost();
    }
  }, [id, navigate, user, userRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("free_posts")
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
      
      toast.success("게시물이 성공적으로 수정되었습니다.");
      navigate(`/freeboards/${id}`);
    } catch (error: any) {
      console.error("게시물 수정 실패:", error);
      toast.error("게시물 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="게시물 수정" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>게시물 수정</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label htmlFor="title" className="text-sm font-medium">
                      제목
                    </label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="게시물 제목을 입력하세요"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="content" className="text-sm font-medium">
                      내용
                    </label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="게시물 내용을 입력하세요"
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/freeboards/${id}`)}
                      disabled={saving}
                    >
                      취소
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                          저장 중...
                        </>
                      ) : (
                        "저장"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default FreeBoardEdit;
