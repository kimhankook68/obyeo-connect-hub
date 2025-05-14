
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const FreeBoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };

    fetchUser();
  }, []);

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

        // Fetch comments
        await fetchComments();
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

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("free_post_comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("댓글 가져오기 실패:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "댓글을 작성하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setCommentLoading(true);
      const { error } = await supabase
        .from("free_post_comments")
        .insert([
          {
            post_id: id,
            author: user.email,
            user_id: user.id,
            content: newComment.trim()
          }
        ]);

      if (error) throw error;

      toast("댓글이 성공적으로 작성되었습니다.");
      setNewComment("");
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      toast("댓글 작성에 실패했습니다.");
    } finally {
      setCommentLoading(false);
    }
  };

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

              <div className="p-6 border rounded-lg">
                <h2 className="text-xl font-semibold mb-4">댓글 ({comments.length})</h2>
                
                {comments.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-muted/30 rounded-md">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4 text-center">아직 댓글이 없습니다.</p>
                )}

                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">새 댓글 작성</h3>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "댓글을 작성하세요..." : "댓글을 작성하려면 로그인이 필요합니다."}
                    className="min-h-[100px]"
                    disabled={!user}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCommentSubmit}
                      disabled={commentLoading || !user}
                    >
                      {commentLoading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                          저장 중...
                        </>
                      ) : (
                        "댓글 작성"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FreeBoardDetail;
