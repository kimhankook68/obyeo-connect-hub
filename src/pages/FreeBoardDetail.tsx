import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import CommentList from "@/components/CommentList";
import { Pencil, Trash2, MessageCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FreeBoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [authorName, setAuthorName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user role from profiles
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role, name")
          .eq("id", session.user.id)
          .single();
          
        if (profileData) {
          setUserRole(profileData.role);
        }
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        // Fetch post details without using the relation
        const { data: postData, error: postError } = await supabase
          .from("free_posts")
          .select("*")
          .eq("id", id)
          .single();

        if (postError) throw postError;
        
        // Set the post data
        setPost(postData);
        
        // If there's a user_id, try to get the profile data separately
        if (postData.user_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", postData.user_id)
            .single();
            
          if (profileData && profileData.name) {
            setAuthorName(profileData.name);
          } else {
            setAuthorName(postData.author.split('@')[0]);
          }
        } else {
          setAuthorName(postData.author.split('@')[0]);
        }

        // Fetch comments
        await fetchComments();
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

    if (id) {
      fetchPost();
    }
  }, [id, navigate]);

  const fetchComments = async () => {
    try {
      // Get comments first
      const { data: commentsData, error: commentsError } = await supabase
        .from("free_post_comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;
      
      // Get profile names for each comment
      const commentsWithAuthors = await Promise.all((commentsData || []).map(async (comment) => {
        if (comment.user_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", comment.user_id)
            .single();
            
          return { 
            ...comment, 
            authorName: profileData?.name || comment.author.split('@')[0] 
          };
        }
        return { ...comment, authorName: comment.author.split('@')[0] };
      }));
      
      setComments(commentsWithAuthors || []);
    } catch (error) {
      console.error("댓글 가져오기 실패:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      toast.error("로그인 필요", {
        description: "댓글을 작성하려면 로그인이 필요합니다."
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

      toast.success("댓글이 성공적으로 작성되었습니다.");
      setNewComment("");
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      toast.error("댓글 작성에 실패했습니다.");
    } finally {
      setCommentLoading(false);
    }
  };
  
  const handleDeletePost = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("free_posts")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success("게시물이 삭제되었습니다.");
      navigate("/freeboards");
    } catch (error) {
      console.error("게시물 삭제 실패:", error);
      toast.error("게시물 삭제에 실패했습니다.");
      setLoading(false);
    }
  };
  
  const canEditOrDelete = () => {
    if (!user || !post) return false;
    return user.id === post.user_id || userRole === 'admin';
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <div className="space-y-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      {comments.length > 0 && (
                        <Badge variant="comment" className="mt-2 flex items-center gap-1 w-fit">
                          <MessageCircle className="h-3 w-3" />
                          <span>댓글 {comments.length}개</span>
                        </Badge>
                      )}
                    </div>
                    {canEditOrDelete() && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/freeboards/edit/${post.id}`)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> 수정
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setOpenDeleteDialog(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> 삭제
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>작성자: {authorName}</span>
                    <span>작성일: {formatDate(post.created_at)}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="min-h-[200px] whitespace-pre-wrap">
                    {post.content}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">댓글 {comments.length}개</CardTitle>
                </CardHeader>
                <CardContent>
                  {comments.length > 0 ? (
                    <div className="space-y-4 mb-6">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-muted/30 rounded-md">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">
                              {comment.authorName}
                            </span>
                            <span className="text-muted-foreground">
                              {formatDate(comment.created_at)}
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
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
      
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시물 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 게시물을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FreeBoardDetail;
