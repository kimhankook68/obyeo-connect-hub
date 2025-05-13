
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, FileText, Trash2, PenLine, Send, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Notice = {
  id: string;
  title: string;
  author: string;
  category: string;
  created_at: string;
  content?: string;
  views: number;
  user_id: string;
  attachment_url?: string;
};

type Comment = {
  id: string;
  notice_id: string;
  user_id: string;
  author: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const NoticeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser();
    if (id) {
      fetchNotice(id);
      fetchComments(id);
      incrementViews(id);
    }
  }, [id]);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
  };

  const fetchNotice = async (noticeId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('id', noticeId)
        .single();
      
      if (error) {
        throw error;
      }

      setNotice(data);
    } catch (error) {
      console.error('공지사항을 가져오는 중 오류가 발생했습니다:', error);
      setError('공지사항을 불러올 수 없습니다.');
      toast({
        title: "데이터 로드 실패",
        description: "공지사항을 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (noticeId: string) => {
    try {
      setCommentLoading(true);
      const { data, error } = await supabase
        .from('notice_comments')
        .select('*')
        .eq('notice_id', noticeId)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw error;
      }

      setComments(data || []);
    } catch (error) {
      console.error('댓글을 가져오는 중 오류가 발생했습니다:', error);
      toast({
        title: "댓글 로드 실패",
        description: "댓글을 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const incrementViews = async (noticeId: string) => {
    try {
      await supabase.rpc('increment_notice_views', { notice_id: noticeId });
    } catch (error) {
      console.error('조회수 업데이트 중 오류가 발생했습니다:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      
      // 첨부 파일이 있는 경우 삭제
      if (notice?.attachment_url) {
        const fileName = notice.attachment_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('attachments')
            .remove([fileName]);
        }
      }
      
      // 공지사항 삭제
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }

      toast({
        title: "삭제 완료",
        description: "공지사항이 삭제되었습니다.",
      });
      navigate('/notices');
    } catch (error) {
      console.error('공지사항 삭제 중 오류가 발생했습니다:', error);
      toast({
        title: "삭제 실패",
        description: "공지사항 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "로그인이 필요합니다",
        description: "댓글을 작성하려면 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "내용을 입력해주세요",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCommentLoading(true);
      
      // Get user name from profile if it exists
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', currentUser.id)
        .single();
      
      // Use profile name, user metadata, or email for author name
      const authorName = profileData?.name || 
                       currentUser.user_metadata?.name || 
                       currentUser.email?.split('@')[0] || 
                       '사용자';
                       
      const { error } = await supabase
        .from('notice_comments')
        .insert({
          notice_id: id,
          user_id: currentUser.id,
          author: authorName,
          content: newComment
        });
      
      if (error) {
        throw error;
      }
      
      // Refresh comments and clear input
      fetchComments(id!);
      setNewComment("");
      
      toast({
        title: "댓글 작성 완료",
        description: "댓글이 등록되었습니다.",
      });
    } catch (error) {
      console.error('댓글 작성 중 오류가 발생했습니다:', error);
      toast({
        title: "댓글 작성 실패",
        description: "댓글을 등록하는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setCommentLoading(true);
      
      const { error } = await supabase
        .from('notice_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) {
        throw error;
      }
      
      // Refresh comments
      setComments(comments.filter(comment => comment.id !== commentId));
      
      toast({
        title: "댓글 삭제 완료",
        description: "댓글이 삭제되었습니다.",
      });
    } catch (error) {
      console.error('댓글 삭제 중 오류가 발생했습니다:', error);
      toast({
        title: "댓글 삭제 실패",
        description: "댓글을 삭제하는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const renderCategoryBadge = (category: string) => {
    let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    
    switch (category) {
      case "공지":
        badgeVariant = "default";
        break;
      case "모집":
        badgeVariant = "outline";
        break;
      case "행사":
        badgeVariant = "secondary";
        break;
      default:
        badgeVariant = "secondary";
        break;
    }
    
    return <Badge variant={badgeVariant}>{category}</Badge>;
  };

  const downloadAttachment = async () => {
    if (!notice?.attachment_url) return;
    
    try {
      const fileName = notice.attachment_url.split('/').pop() || '';
      
      const { data, error } = await supabase.storage
        .from('attachments')
        .download(fileName);
      
      if (error) {
        throw error;
      }
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('첨부 파일 다운로드 중 오류가 발생했습니다:', error);
      toast({
        title: "다운로드 실패",
        description: "첨부 파일을 다운로드하는 데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // Generate avatar fallback from author name
  const getAvatarFallback = (name: string) => {
    if (!name) return "??";
    const initials = name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    return initials || "??";
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/notices')}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              목록으로
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : notice ? (
            <>
              <Card className="mb-6">
                <CardHeader className="border-b border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {notice.category && renderCategoryBadge(notice.category)}
                      </div>
                      <CardTitle className="text-2xl font-semibold">{notice.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/notices/edit/${notice.id}`)}
                      >
                        <PenLine className="h-4 w-4 mr-1" />
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-4">
                    <div>
                      작성자: {notice.author} | 작성일: {formatDate(notice.created_at)}
                    </div>
                    <div>조회수: {notice.views}</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {notice.attachment_url && (
                    <div 
                      className="bg-muted p-3 rounded-lg mb-6 flex items-center gap-2 cursor-pointer hover:bg-muted/80"
                      onClick={downloadAttachment}
                    >
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">
                        첨부 파일: {notice.attachment_url.split('/').pop()}
                      </span>
                    </div>
                  )}
                  
                  <div className="prose max-w-none">
                    {notice.content ? (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{notice.content}</div>
                    ) : (
                      <p className="text-muted-foreground">내용이 없습니다.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Comments Section */}
              <Card>
                <CardHeader className="border-b border-border">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">댓글</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => fetchComments(id!)}
                      disabled={commentLoading}
                    >
                      <RefreshCcw className={`h-4 w-4 mr-1 ${commentLoading ? 'animate-spin' : ''}`} />
                      새로고침
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="py-4">
                  {comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map(comment => (
                        <div key={comment.id} className="py-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{getAvatarFallback(comment.author)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{comment.author}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(comment.created_at)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Show delete option if comment belongs to current user */}
                            {currentUser && currentUser.id === comment.user_id && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <span className="sr-only">메뉴 열기</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-40 p-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteComment(comment.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    삭제하기
                                  </Button>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                          
                          <div className="pl-10 whitespace-pre-wrap text-sm">
                            {comment.content}
                          </div>
                          
                          <Separator className="mt-4" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="border-t border-border pt-4">
                  {currentUser ? (
                    <form onSubmit={handleCommentSubmit} className="w-full">
                      <div className="space-y-2">
                        <Label htmlFor="comment">댓글 작성</Label>
                        <div className="flex gap-2">
                          <Textarea 
                            id="comment"
                            value={newComment} 
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                            className="flex-1"
                          />
                          <Button 
                            type="submit" 
                            disabled={commentLoading || !newComment.trim()} 
                            className="self-end"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            등록
                          </Button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="w-full text-center py-4">
                      <p className="text-muted-foreground mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
                      <Button onClick={() => navigate('/auth')}>로그인하기</Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </>
          ) : (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>공지사항을 찾을 수 없습니다.</AlertDescription>
            </Alert>
          )}
        </main>
      </div>
    </div>
  );
};

export default NoticeDetail;
