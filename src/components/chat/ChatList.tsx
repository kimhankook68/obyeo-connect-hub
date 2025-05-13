
import React from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ChatListProps {
  chats: any[];
  selectedChatId: string | null;
  onSelect: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onSelect }) => {
  // Sort chats by most recent activity
  const sortedChats = [...chats].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: false, 
      locale: ko 
    });
  };

  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold mb-3 px-1">메시지</h2>
      <p className="text-sm text-muted-foreground mb-4 px-1">동료들과 메시지를 주고받으세요.</p>
      
      <div className="relative mb-4">
        <input
          type="search"
          placeholder="대화 검색"
          className="w-full pl-9 pr-3 py-2 rounded-md bg-background border border-input"
        />
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
      </div>
      
      {sortedChats.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          채팅방이 없습니다.
        </div>
      ) : (
        <div className="space-y-0">
          {sortedChats.map((chat) => {
            const participantCount = chat.chat_participants?.length || 0;
            const isSelected = chat.id === selectedChatId;
            
            return (
              <div
                key={chat.id}
                onClick={() => onSelect(chat.id)}
                className={cn(
                  "flex items-center p-3 cursor-pointer rounded-md transition-colors relative",
                  isSelected 
                    ? "bg-primary/10 hover:bg-primary/15" 
                    : "hover:bg-muted"
                )}
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 text-primary">
                  {chat.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className={cn("font-medium truncate", isSelected && "text-primary")}>
                      {chat.name}
                    </h3>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                      {formatTime(chat.updated_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {participantCount === 1 
                      ? "나만 있는 채팅방" 
                      : `참여자 ${participantCount}명`}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
                )}
                {chat.unreadCount > 0 && (
                  <div className="absolute right-3 top-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-foreground">{chat.unreadCount}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
