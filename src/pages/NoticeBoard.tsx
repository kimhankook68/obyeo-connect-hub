import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, ArrowRight, PlusCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
const NoticeBoard = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    fetchNotices();
  }, [currentPage]);
  const fetchNotices = async () => {
    try {
      setLoading(true);

      // 전체 공지사항 수를 먼저 가져옴
      const {
        count
      } = await supabase.from('notices').select('*', {
        count: 'exact',
        head: true
      });
      if (count !== null) {
        setTotalPages(Math.ceil(count / pageSize));
      }

      // 페이지네이션된 공지사항 데이터를 가져옴
      const {
        data,
        error
      } = await supabase.from('notices').select('*').order('created_at', {
        ascending: false
      }).range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      if (error) {
        console.error('공지사항 데이터를 가져오는 중 오류가 발생했습니다:', error);
        toast({
          title: "데이터 로드 실패",
          description: "공지사항을 불러오는 데 실패했습니다.",
          variant: "destructive"
        });
        return;
      }
      setNotices(data || []);
    } catch (error) {
      console.error('예상치 못한 오류가 발생했습니다:', error);
      toast({
        title: "오류 발생",
        description: "예상치 못한 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };
  const renderCategoryBadge = (category: string) => {
    let bgClass = "bg-secondary text-muted-foreground";
    switch (category) {
      case "공지":
        bgClass = "bg-blue-100 text-blue-800";
        break;
      case "모집":
        bgClass = "bg-green-100 text-green-800";
        break;
      case "행사":
        bgClass = "bg-purple-100 text-purple-800";
        break;
      default:
        break;
    }
    return <span className={`px-2 py-0.5 text-xs rounded-full ${bgClass}`}>
        {category}
      </span>;
  };
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  return <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="공지사항" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">공지사항</h1>
            <Button onClick={() => navigate('/notices/create')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              공지사항 작성
            </Button>
          </div>
          
          <Card>
            
            <CardContent>
              {loading ? <div className="flex justify-center my-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div> : <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">번호</TableHead>
                          <TableHead className="w-[100px]">분류</TableHead>
                          <TableHead>제목</TableHead>
                          <TableHead className="w-[120px]">작성자</TableHead>
                          <TableHead className="w-[120px]">등록일</TableHead>
                          <TableHead className="w-[80px]">조회수</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notices.length > 0 ? notices.map((notice, index) => <TableRow key={notice.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/notices/${notice.id}`)}>
                              <TableCell className="text-center">
                                {(currentPage - 1) * pageSize + index + 1}
                              </TableCell>
                              <TableCell>
                                {notice.category ? renderCategoryBadge(notice.category) : '-'}
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="truncate">
                                  {notice.title}
                                  {notice.attachment_url && <FileText size={16} className="text-blue-500" />}
                                </div>
                              </TableCell>
                              <TableCell>{notice.author}</TableCell>
                              <TableCell>{formatDate(notice.created_at)}</TableCell>
                              <TableCell className="text-center">{notice.views}</TableCell>
                            </TableRow>) : <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              공지사항이 없습니다.
                            </TableCell>
                          </TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {totalPages > 1 && <div className="flex justify-center mt-6 gap-2">
                      <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      
                      {Array.from({
                  length: Math.min(5, totalPages)
                }, (_, i) => {
                  // 현재 페이지를 중심으로 표시할 페이지 번호 계산
                  const pageNum = Math.max(1, Math.min(currentPage - Math.floor(5 / 2) + i, totalPages - 4 + i, currentPage + Math.floor(5 / 2) - (5 - 1) + i));
                  return <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} onClick={() => goToPage(pageNum)} className="w-10 h-10">
                            {pageNum}
                          </Button>;
                })}
                      
                      <Button variant="outline" size="icon" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>}
                </>}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>;
};
export default NoticeBoard;