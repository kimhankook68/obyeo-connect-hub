
import React from "react";
import { cn } from "@/lib/utils";

type NoticeProps = {
  title: string;
  date: string;
  author: string;
  isNew?: boolean;
  isPinned?: boolean;
  category?: string;
};

const NoticeCard = ({ title, date, author, isNew = false, isPinned = false, category }: NoticeProps) => {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-grow">
        <div className="flex items-center gap-2">
          {isPinned && <span className="text-red-500">📌</span>}
          {category && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-muted-foreground">
              {category}
            </span>
          )}
        </div>
        <span className={cn("line-clamp-1", isNew && "font-medium")}>
          {title}
          {isNew && (
            <span className="inline-flex items-center justify-center ml-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full">
              N
            </span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
        <span>{author}</span>
        <span>•</span>
        <span>{date}</span>
      </div>
    </div>
  );
};

export default NoticeCard;
