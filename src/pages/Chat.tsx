import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ChatList from "@/components/chat/ChatList";
import MessagesList from "@/components/chat/MessagesList";
import ParticipantsList from "@/components/chat/ParticipantsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Chat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [newChatName, setNewChatName] = useState("");
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase.from('chats').select('*');
      if (error) {
        toast.error("채팅 목록을 불러오는 데 실패했습니다.");
      } else {
        setChats(data);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (chatId) {
      const fetchChatDetails = async () => {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single();
        if (error) {
          toast.error("채팅 정보를 불러오는 데 실패했습니다.");
        } else {
          setActiveChat(data);
          fetchMessages(chatId);
        }
      };

      fetchChatDetails();
    }
  }, [chatId]);

  const fetchMessages = async (chatId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId);
    if (error) {
      toast.error("메시지를 불러오는 데 실패했습니다.");
    } else {
      setMessages(data);
    }
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    fetchMessages(chat.id);
  };

  const handleCreateChat = async () => {
    const { error } = await supabase
      .from('chats')
      .insert({ name: newChatName });
    if (error) {
      toast.error("채팅방 생성에 실패했습니다.");
    } else {
      setNewChatName("");
      setShowNewChatForm(false);
      fetchChats();
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        chat_id: activeChat.id,
        content: messageContent,
        created_at: new Date().toISOString(),
      });
    if (error) {
      toast.error("메시지 전송에 실패했습니다.");
    } else {
      setMessageContent("");
      fetchMessages(activeChat.id);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="w-72 border-r hidden md:block overflow-auto">
        <div className="p-4 border-b sticky top-0 bg-background z-10">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => setShowNewChatForm(!showNewChatForm)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            새 채팅방
          </Button>
        </div>
        
        {showNewChatForm && (
          <div className="p-4 border-b">
            <Input
              placeholder="채팅방 이름"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              className="mb-2"
            />
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1" onClick={handleCreateChat}>
                생성
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowNewChatForm(false)}
              >
                취소
              </Button>
            </div>
          </div>
        )}
        
        <ChatList 
          chats={chats} 
          activeChat={activeChat} 
          onSelect={handleSelectChat} 
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        <Header>
          <div className="flex items-center justify-between w-full">
            <span>{activeChat?.name || '메시지'}</span>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 md:hidden">
                  <Users className="h-4 w-4" />
                  <span className="sr-only">참여자 목록</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-4">
                  <ChatList 
                    chats={chats} 
                    activeChat={activeChat} 
                    onSelect={(chat) => {
                      handleSelectChat(chat);
                      document.querySelector('[data-radix-collection-item]')?.click?.();
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            {activeChat && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <Users className="mr-2 h-4 w-4" />
                    참여자 ({participants.length})
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <ParticipantsList participants={participants} />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </Header>
        
        <div className="flex-1 overflow-auto">
          <MessagesList messages={messages} />
          <div className="p-4 border-t">
            <Input
              placeholder="메시지를 입력하세요..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
