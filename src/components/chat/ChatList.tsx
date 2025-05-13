
import React from "react";
import { cn } from "@/lib/utils";

interface ChatListProps {
  chats: any[];
  selectedChatId: string | null;
  onSelect: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onSelect }) => {
  if (chats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        채팅방이 없습니다. 새로운 채팅방을 만들어보세요.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={cn(
            "px-4 py-3 rounded-md cursor-pointer hover:bg-muted transition-colors",
            selectedChatId === chat.id ? "bg-muted" : ""
          )}
          onClick={() => onSelect(chat.id)}
        >
          <div className="font-medium truncate">{chat.name}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(chat.updated_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
