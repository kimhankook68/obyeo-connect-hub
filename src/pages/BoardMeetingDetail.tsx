
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";
import Header from "@/components/Header";
import { File } from "lucide-react";

interface BoardMeeting {
  id: string;
  title: string;
  content?: string;
  meeting_date: string;
  location?: string;
  created_at: string;
  updated_at?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  user_id?: string;
}

interface BoardMeetingFile {
  id: string;
  board_meeting_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  created_at: string;
}

const BoardMeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: meeting, isLoading, error } = useQuery({
    queryKey: ['boardMeeting', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('board_meetings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as BoardMeeting;
    },
    enabled: !!id
  });

  const { data: files = [] } = useQuery({
    queryKey: ['boardMeetingFiles', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('board_meeting_files')
        .select('*')
        .eq('board_meeting_id', id);
      
      if (error) throw error;
      return data as BoardMeetingFile[];
    },
    enabled: !!id
  });

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('board_meetings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("이사회가 삭제되었습니다.");
      navigate('/board-meetings');
    } catch (error: any) {
      toast.error("이사회 삭제 중 오류가 발생했습니다: " + error.message);
    }
  };

  const downloadFile = async (file: BoardMeetingFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('board_meeting_files')
        .download(file.file_path);
        
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error("파일 다운로드에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <Header title="이사회 상세" subtitle="이사회 정보를 확인합니다" />
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <Header title="이사회 상세" subtitle="이사회 정보를 확인합니다" />
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-red-500 mb-4">이사회 정보를 불러올 수 없습니다.</p>
            <Button onClick={() => navigate('/board-meetings')}>
              이사회 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <Header title="이사회 상세" subtitle="이사회 정보를 확인합니다" />
        
        <div className="p-6 flex-1 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{meeting.title}</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate(`/board-meetings/edit/${id}`)}>
                수정
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                삭제
              </Button>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">일시</h3>
                <p>{formatDate(meeting.meeting_date)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">장소</h3>
                <p>{meeting.location || "미정"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">상태</h3>
                <div>
                  {meeting.status === 'upcoming' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">예정</span>
                  )}
                  {meeting.status === 'completed' && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">완료</span>
                  )}
                  {meeting.status === 'cancelled' && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">취소</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">등록일</h3>
                <p>{formatDate(meeting.created_at)}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">이사회 내용</h3>
            <div className="bg-white p-4 rounded-lg border whitespace-pre-wrap">
              {meeting.content || "등록된 내용이 없습니다."}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">이사회 자료</h3>
            {files.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                등록된 자료가 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <Card key={file.id} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <File className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="font-medium">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadFile(file)}
                      >
                        다운로드
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이사회 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 이사회를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BoardMeetingDetail;
