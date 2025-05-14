import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface FileUploaderProps {
  onSuccess?: () => void;
}

const FileUploader = ({ onSuccess }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Fetch current user on component mount
  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Get user name from profile if it exists
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single();
        
        // Auto-populate author field with user's name from profile if available
        const userName = profileData?.name || 
                         session.user.user_metadata?.name || 
                         session.user.email?.split('@')[0] || 
                         '사용자';
        
        setAuthor(userName);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("파일을 선택해주세요");
      return;
    }

    if (!title) {
      toast.error("제목을 입력해주세요");
      return;
    }

    if (!author) {
      toast.error("작성자를 입력해주세요");
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. 현재 사용자 확인
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("로그인이 필요합니다");
      }
      
      // 2. 파일 업로드
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      // 3. 문서 메타데이터 저장 - 중요: author 필드 제거, user_id 필드 추가
      const { error: dbError } = await supabase.from('documents').insert({
        title,
        description,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        user_id: session.user.id // 사용자 ID 추가
      });

      if (dbError) throw dbError;

      toast.success("파일이 성공적으로 업로드되었습니다");
      
      // 폼 리셋
      setFile(null);
      setTitle("");
      setDescription("");
      
      // 성공 콜백
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('파일 업로드 오류:', error);
      toast.error("파일 업로드 실패", {
        description: error.message || "알 수 없는 오류가 발생했습니다"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">제목</label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="파일 제목"
          required
        />
      </div>
      
      <div>
        <label htmlFor="author" className="block text-sm font-medium mb-1">작성자</label>
        <Input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="작성자 이름"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">설명 (선택사항)</label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="파일에 대한 설명"
          rows={3}
        />
      </div>
      
      <div>
        <label htmlFor="file" className="block text-sm font-medium mb-1">파일</label>
        <Input
          id="file"
          type="file"
          onChange={handleFileChange}
          className="cursor-pointer"
          required
        />
      </div>

      <Button type="submit" disabled={isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            업로드 중...
          </>
        ) : "파일 업로드"}
      </Button>
    </form>
  );
};

export default FileUploader;
