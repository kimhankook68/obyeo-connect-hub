
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
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "파일을 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!title) {
      toast({
        title: "제목을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. 파일 업로드
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      // 2. 문서 메타데이터 저장
      const { error: dbError } = await supabase.from('documents').insert({
        title,
        description,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size
      });

      if (dbError) throw dbError;

      toast({
        title: "파일이 성공적으로 업로드되었습니다",
      });
      
      // 폼 리셋
      setFile(null);
      setTitle("");
      setDescription("");
      
      // 성공 콜백
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('파일 업로드 오류:', error);
      toast({
        title: "파일 업로드 실패",
        description: error.message || "알 수 없는 오류가 발생했습니다",
        variant: "destructive",
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
