
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "@/components/FileUploader";

interface CommentFormProps {
  onSubmit: (comment: string, file: File | null) => Promise<void>;
  loading: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, loading }) => {
  const [newComment, setNewComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && !file) return;
    
    await onSubmit(newComment, file);
    setNewComment("");
    setFile(null);
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <Textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="댓글을 입력하세요..."
        className="mb-3"
      />
      <div className="flex gap-2">
        <FileUploader 
          onFileSelected={handleFileChange}
          className="flex-grow"
        />
        {file && (
          <div className="text-sm text-muted-foreground self-center">
            {file.name} ({Math.round(file.size / 1024)} KB)
          </div>
        )}
      </div>
      <div className="flex justify-end mt-3">
        <Button 
          type="submit" 
          disabled={loading || (!newComment.trim() && !file)}
        >
          {loading ? "제출 중..." : "댓글 작성"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
