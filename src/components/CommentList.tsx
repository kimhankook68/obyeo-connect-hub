
import React from "react";
import { Separator } from "@/components/ui/separator";

interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList = ({ comments }: CommentListProps) => {
  if (comments.length === 0) {
    return (
      <p className="text-muted-foreground mb-4 text-center">아직 댓글이 없습니다.</p>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {comments.map((comment) => (
        <div key={comment.id} className="p-3 bg-muted/30 rounded-md">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{comment.author}</span>
            <span className="text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
