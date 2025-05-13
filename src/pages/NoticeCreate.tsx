
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

type FormData = {
  title: string;
  author: string;
  category: string;
  content: string;
};

const NoticeCreate = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      author: "",
      category: "공지",
      content: "",
    },
  });

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        // Auto-populate author field with user's name
        const userName = session.user.user_metadata?.name || 
                         session.user.email?.split('@')[0] || 
                         '사용자';
        form.setValue("author", userName);
      } else {
        // Redirect to login if no user
        toast({
          title: "로그인 필요",
          description: "공지사항을 작성하려면 로그인이 필요합니다.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    fetchCurrentUser();
  }, [navigate, toast, form]);

  const onSubmit = async (data: FormData) => {
    if (!currentUser) {
      toast({
        title: "로그인 필요",
        description: "공지사항을 등록하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      setUploading(true);
      
      let attachmentUrl = null;
      
      // 첨부 파일이 있다면 업로드
      if (selectedFile) {
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
      
      // 공지사항 데이터 저장
      const { data: notice, error } = await supabase
        .from('notices')
        .insert([
          {
            title: data.title,
            author: data.author,
            category: data.category,
            content: data.content,
            attachment_url: attachmentUrl,
            user_id: currentUser.id, // Use the actual user ID
          },
        ])
        .select('id')
        .single();
      
      if (error) {
        throw error;
      }

      toast({
        title: "작성 완료",
        description: "공지사항이 등록되었습니다.",
      });
      
      // 작성된 공지사항 상세 페이지로 이동
      navigate(`/notices/${notice.id}`);
    } catch (error) {
      console.error('공지사항 등록 중 오류가 발생했습니다:', error);
      toast({
        title: "등록 실패",
        description: "공지사항 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/notices')}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              목록으로
            </Button>
          </div>
          
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>공지사항 작성</CardTitle>
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
                    <FormLabel htmlFor="file">첨부 파일</FormLabel>
                    <div className="mt-1 flex items-center gap-4">
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                      {selectedFile && (
                        <div className="text-sm text-muted-foreground">
                          {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/notices')}
                    >
                      취소
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                          저장 중...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          등록
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default NoticeCreate;
