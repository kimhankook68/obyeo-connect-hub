
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  onSubmit: (comment: string) => Promise<void>;
  loading: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, loading }) => {
  const [newComment, setNewComment] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    await onSubmit(newComment);
    setNewComment("");
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <Textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="댓글을 입력하세요..."
        className="mb-3"
      />
      <div className="flex justify-end mt-3">
        <Button 
          type="submit" 
          disabled={loading || !newComment.trim()}
        >
          {loading ? "제출 중..." : "댓글 작성"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
