
import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Comment {
  id: string;
  author: string;
  content: string | React.ReactNode;
  created_at: string;
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList = ({ comments }: CommentListProps) => {
  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-center text-muted-foreground">댓글이 없습니다.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="border-b border-border pb-4 last:border-0">
            <div className="flex items-center mb-2">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback className="text-xs">
                  {comment.author.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{comment.author}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-sm">{comment.content}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentList;
