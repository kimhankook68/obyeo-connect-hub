
import React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";

interface ChatMessageProps {
  message: any;
  isOwn: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn }) => {
  const downloadFile = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('chat_files')
        .download(message.file_path);
        
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = message.file_name || 'download';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className={cn("flex mb-3", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary text-xs">
          {message.sender_name.charAt(0).toUpperCase()}
        </div>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2",
          isOwn 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-muted rounded-tl-none"
        )}
      >
        {!isOwn && (
          <div className="text-xs font-medium mb-1">{message.sender_name}</div>
        )}
        
        {message.content && <div className="mb-1">{message.content}</div>}
        
        {message.file_path && (
          <div className="mt-2">
            <Button 
              variant={isOwn ? "secondary" : "outline"} 
              className="w-full text-left flex items-center" 
              onClick={downloadFile}
            >
              <File className="h-4 w-4 mr-2" />
              <div className="truncate flex-1">
                {message.file_name}
              </div>
              {message.file_size && (
                <span className="text-xs ml-2">
                  {formatFileSize(message.file_size)}
                </span>
              )}
            </Button>
          </div>
        )}
        
        <div className="text-xs mt-1 opacity-70 text-right">
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
