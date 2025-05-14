
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, Save, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type FormData = {
  title: string;
  author: string;
  category: string;
  content: string;
};

const NoticeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAttachment, setCurrentAttachment] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<FormData>();

  useEffect(() => {
    // Get current user info
    const fetchUserAndNotice = async () => {
      setLoading(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "로그인 필요",
          description: "공지사항을 수정하려면 로그인이 필요합니다.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }
      
      setCurrentUser(session.user);
      
      // Get notice details
      if (id) {
        try {
          const { data, error } = await supabase
            .from('notices')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            throw error;
          }

          // Check if current user is the author (using author field or user_id)
          if (session.user.id !== data.user_id) {
            toast({
              title: "접근 권한 없음",
              description: "자신이 작성한 공지사항만 수정할 수 있습니다.",
              variant: "destructive",
            });
            navigate(`/notices/${id}`);
            return;
          }

          setNotice(data);
          setCurrentAttachment(data.attachment_url || null);
          
          // 폼 초기값 설정
          form.reset({
            title: data.title,
            author: data.author,
            category: data.category,
            content: data.content || "",
          });
          
          setLoading(false);
        } catch (error) {
          console.error('공지사항을 가져오는 중 오류가 발생했습니다:', error);
          setError('공지사항을 불러올 수 없습니다.');
          toast({
            title: "데이터 로드 실패",
            description: "공지사항을 불러오는 데 실패했습니다.",
            variant: "destructive",
          });
          setLoading(false);
        }
      }
    };

    fetchUserAndNotice();
  }, [id, navigate, toast, form]);

  const onSubmit = async (data: FormData) => {
    if (!id || !notice || !currentUser) return;
    
    try {
      setSaving(true);
      
      let attachmentUrl = currentAttachment;
      
      // 새로운 첨부 파일이 있다면 기존 파일은 삭제하고 새 파일 업로드
      if (selectedFile) {
        // 기존 파일 삭제
        if (currentAttachment) {
          const existingFileName = currentAttachment.split('/').pop();
          if (existingFileName) {
            await supabase.storage
              .from('attachments')
              .remove([existingFileName]);
          }
        }
        
        // 새 파일 업로드
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, selectedFile);
        
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: publicUrl } = supabase.storage
          .from('attachments')
          .getPublicUrl(fileName);
          
        attachmentUrl = publicUrl.publicUrl;
      }
      
      // 첨부 파일을 삭제했다면
      if (!selectedFile && currentAttachment === null && notice.attachment_url) {
        const existingFileName = notice.attachment_url.split('/').pop();
        if (existingFileName) {
          await supabase.storage
            .from('attachments')
            .remove([existingFileName]);
        }
      }
      
      // 공지사항 데이터 업데이트
      const { error } = await supabase
        .from('notices')
        .update({
          title: data.title,
          author: data.author, // Keep the original author
          category: data.category,
          content: data.content,
          attachment_url: attachmentUrl,
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }

      toast({
        title: "수정 완료",
        description: "공지사항이 수정되었습니다.",
      });
      
      // 수정된 공지사항 상세 페이지로 이동
      navigate(`/notices/${id}`);
    } catch (error) {
      console.error('공지사항 수정 중 오류가 발생했습니다:', error);
      toast({
        title: "수정 실패",
        description: "공지사항 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const removeCurrentAttachment = () => {
    setCurrentAttachment(null);
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="공지사항 수정" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/notices/${id}`)}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              상세 보기로 돌아가기
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
          ) : (
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle>공지사항 수정</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      rules={{ required: "제목을 입력해주세요" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>제목</FormLabel>
                          <FormControl>
                            <Input placeholder="제목을 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="author"
                        rules={{ required: "작성자명을 입력해주세요" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>작성자</FormLabel>
                            <FormControl>
                              <Input placeholder="작성자 이름" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>분류</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="분류 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="공지">공지</SelectItem>
                                <SelectItem value="모집">모집</SelectItem>
                                <SelectItem value="행사">행사</SelectItem>
                                <SelectItem value="기타">기타</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="content"
                      rules={{ required: "내용을 입력해주세요" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>내용</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="내용을 입력하세요"
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>첨부 파일</FormLabel>
                      <div className="mt-1">
                        {currentAttachment ? (
                          <div className="bg-muted p-3 rounded-lg mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <span className="text-sm">
                                {currentAttachment.split('/').pop()}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeCurrentAttachment}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Input
                            id="file"
                            type="file"
                            onChange={handleFileChange}
                            className="mb-3"
                          />
                        )}
                        {selectedFile && (
                          <div className="text-sm text-muted-foreground">
                            새 파일: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/notices/${id}`)}
                      >
                        취소
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                            저장 중...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            저장
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default NoticeEdit;
