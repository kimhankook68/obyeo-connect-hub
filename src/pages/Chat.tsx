
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import Header from "@/components/Header";
import ChatList from "@/components/chat/ChatList";
import MessagesList from "@/components/chat/MessagesList";
import ParticipantsList from "@/components/chat/ParticipantsList";

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [chatName, setChatName] = useState("");
  const [isParticipantOpen, setIsParticipantOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
        return;
      }
      setUser(data.session.user);
      fetchChats();
    };

    checkAuth();
  }, [navigate]);

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from("chats")
        .select("*, chat_participants(*)");

      if (error) throw error;
      setChats(data || []);
      
      // If there are chats, select the first one
      if (data && data.length > 0 && !selectedChat) {
        setSelectedChat(data[0].id);
      }
    } catch (error: any) {
      toast.error("채팅을 불러오는데 실패했습니다: " + error.message);
    }
  };

  const createChat = async () => {
    if (!chatName.trim()) {
      toast.error("채팅방 이름을 입력해주세요.");
      return;
    }

    try {
      // First create the chat
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .insert({
          name: chatName,
          creator_id: user.id,
        })
        .select();

      if (chatError) throw chatError;

      if (chatData && chatData[0]) {
        // Add the creator as a participant
        const { error: participantError } = await supabase
          .from("chat_participants")
          .insert({
            chat_id: chatData[0].id,
            user_id: user.id,
          });

        if (participantError) throw participantError;

        toast.success("채팅방이 생성되었습니다.");
        setChatName("");
        setNewChatOpen(false);
        fetchChats();
        setSelectedChat(chatData[0].id);
      }
    } catch (error: any) {
      toast.error("채팅방 생성에 실패했습니다: " + error.message);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <Header 
          title="대화하기"
        />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 border-r border-border overflow-y-auto bg-muted/30">
            <div className="p-4">
              <Button 
                className="w-full mb-4" 
                onClick={() => setNewChatOpen(true)}
              >
                새 채팅방 만들기
              </Button>
              <ChatList
                chats={chats}
                selectedChatId={selectedChat}
                onSelect={setSelectedChat}
              />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <MessagesList 
                chatId={selectedChat} 
                user={user}
                onOpenParticipants={() => setIsParticipantOpen(true)}
                currentChat={chats.find(chat => chat.id === selectedChat)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                채팅방을 선택하거나 새로운 채팅방을 만들어보세요.
              </div>
            )}
          </div>
        </div>
        
        <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 채팅방 만들기</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="채팅방 이름"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewChatOpen(false)}>
                취소
              </Button>
              <Button onClick={createChat}>만들기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {selectedChat && (
          <Sheet open={isParticipantOpen} onOpenChange={setIsParticipantOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>참여자 관리</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <ParticipantsList 
                  chatId={selectedChat}
                  currentChat={chats.find(chat => chat.id === selectedChat)}
                  userId={user?.id}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
};

export default Chat;
