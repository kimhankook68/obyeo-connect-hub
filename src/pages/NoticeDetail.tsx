
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, FileText, Trash2, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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

const NoticeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchNotice(id);
      incrementViews(id);
    }
  }, [id]);

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
            <Card>
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
