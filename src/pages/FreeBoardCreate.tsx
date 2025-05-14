
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FreeBoardCreate = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("기타");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        toast.error("로그인 필요", {
          description: "게시물을 작성하려면 로그인이 필요합니다.",
        });
        navigate("/auth");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("free_posts")
        .insert([
          {
            title,
            content,
            author: user.email, // Using email as author name
            user_id: user.id, // Storing the actual user ID
            category // Add the category field
          }
        ])
        .select();

      if (error) throw error;
      
      toast.success("게시물이 성공적으로 작성되었습니다.");
      navigate("/freeboards");
    } catch (error: any) {
      console.error("게시물 작성 실패:", error);
      toast.error("게시물 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="새 게시물 작성" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
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
              <label htmlFor="category" className="text-sm font-medium">
                분류
              </label>
              <Select 
                value={category} 
                onValueChange={setCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="분류를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="질문">질문</SelectItem>
                  <SelectItem value="칭찬">칭찬</SelectItem>
                  <SelectItem value="건의">건의</SelectItem>
                  <SelectItem value="요청">요청</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
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
                onClick={() => navigate("/freeboards")}
                disabled={loading}
              >
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
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
        </main>
      </div>
    </div>
  );
};

export default FreeBoardCreate;
