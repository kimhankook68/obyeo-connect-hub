
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Users } from "lucide-react";
import { toast } from "sonner";
import ChatMessage from "./ChatMessage";

interface MessagesListProps {
  chatId: string;
  user: any;
  onOpenParticipants: () => void;
  currentChat: any;
}

const MessagesList: React.FC<MessagesListProps> = ({ 
  chatId, 
  user,
  onOpenParticipants,
  currentChat
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      setupRealtimeSubscription();
    }
  }, [chatId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      scrollToBottom();
    } catch (error: any) {
      toast.error("메시지를 불러오는데 실패했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newMessage.trim() && !fileInputRef.current?.files?.length) {
      return;
    }

    try {
      let filePath = null;
      let fileName = null;
      let fileType = null;
      let fileSize = null;

      // Upload file if selected
      if (fileInputRef.current?.files?.length) {
        setUploading(true);
        const file = fileInputRef.current.files[0];
        fileName = file.name;
        fileType = file.type;
        fileSize = file.size;
        
        const { data: fileData, error: fileError } = await supabase.storage
          .from('chat_files')
          .upload(`${chatId}/${Date.now()}_${file.name}`, file);

        if (fileError) throw fileError;
        filePath = fileData.path;
        setUploading(false);
      }

      // Send message
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: user.id,
        sender_name: user.email || user.id,
        content: newMessage.trim() || null,
        file_path: filePath,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize
      });

      if (error) throw error;

      setNewMessage("");
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast.error("메시지 전송에 실패했습니다: " + error.message);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">{currentChat?.name}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onOpenParticipants}>
          <Users className="h-4 w-4 mr-2" />
          참여자
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-background">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            메시지가 없습니다. 첫 메시지를 보내보세요!
          </div>
        ) : (
          <div>
            {messages.map(message => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isOwn={message.sender_id === user?.id} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-background">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            onClick={handleFileSelect}
            disabled={uploading}
            className="text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={uploading}
            className="flex-1 bg-muted/40"
          />
          <Button 
            type="submit" 
            disabled={(!newMessage.trim() && !fileInputRef.current?.files?.length) || uploading}
            size="icon"
            className="rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={() => {
              if (fileInputRef.current?.files?.length) {
                toast.success("파일이 선택되었습니다.");
              }
            }}
          />
        </form>
      </div>
    </div>
  );
};

export default MessagesList;
