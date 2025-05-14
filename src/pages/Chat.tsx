
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ChatList from "@/components/chat/ChatList";
import MessagesList from "@/components/chat/MessagesList";
import ParticipantsList from "@/components/chat/ParticipantsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Chat = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [newChatName, setNewChatName] = useState("");
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // 로그인 사용자 정보 가져오기
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // 채팅 목록 가져오기
  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase.from('chats').select('*');
      if (error) {
        toast.error("채팅 목록을 불러오는 데 실패했습니다.");
      } else {
        // 각 채팅에 대한 참여자 수와 읽지 않은 메시지 수 0으로 설정 (실제로는 이 값들을 서버에서 계산해야 함)
        const chatsWithMetadata = data.map((chat) => ({
          ...chat,
          chat_participants: [], // 임시 빈 배열
          unreadCount: 0 // 읽지 않은 메시지 수 (예시)
        }));
        setChats(chatsWithMetadata);
      }
    };

    fetchChats();
  }, []);

  // 채팅방 선택 시 채팅 상세 정보 가져오기
  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId);
    
    // 선택된 채팅 정보 가져오기
    const { data: chatData } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();
    
    if (chatData) {
      setCurrentChat(chatData);
    }
  };

  // 새 채팅방 생성
  const handleCreateChat = async () => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    
    try {
      // 채팅방 생성
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          name: newChatName,
          creator_id: user.id
        })
        .select()
        .single();
      
      if (chatError) throw chatError;
      
      // 채팅방 참여자 등록 (생성자)
      if (chatData) {
        const { error: participantError } = await supabase
          .from('chat_participants')
          .insert({
            chat_id: chatData.id,
            user_id: user.id
          });
        
        if (participantError) throw participantError;
      }
      
      setNewChatName("");
      setShowNewChatForm(false);
      
      // 채팅 목록 다시 가져오기
      const { data, error } = await supabase.from('chats').select('*');
      if (error) throw error;
      setChats(data);
      
      // 새로 생성된 채팅방 선택
      if (chatData) {
        handleSelectChat(chatData.id);
      }
      
      toast.success("채팅방이 생성되었습니다.");
    } catch (error: any) {
      toast.error("채팅방 생성에 실패했습니다: " + error.message);
    }
  };

  // 참여자 목록 가져오기 함수 (시트가 열렸을 때 호출)
  const handleOpenParticipants = async () => {
    if (!selectedChatId) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_participants')
        .select('*')
        .eq('chat_id', selectedChatId);
      
      if (error) throw error;
      setParticipants(data || []);
    } catch (error: any) {
      toast.error("참여자 목록을 불러오는데 실패했습니다: " + error.message);
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
          selectedChatId={selectedChatId} 
          onSelect={handleSelectChat} 
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        <Header>임직원 메시지</Header>
        
        <div className="flex-1 overflow-hidden">
          {selectedChatId ? (
            <MessagesList 
              chatId={selectedChatId} 
              user={user}
              onOpenParticipants={handleOpenParticipants}
              currentChat={currentChat}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p className="mb-4">채팅방을 선택하거나 새로운 채팅방을 만들어주세요.</p>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    채팅방 목록 보기
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="py-4">
                    <ChatList 
                      chats={chats} 
                      selectedChatId={selectedChatId} 
                      onSelect={(chatId) => {
                        handleSelectChat(chatId);
                        const closeButton = document.querySelector('[data-radix-collection-item]');
                        if (closeButton instanceof HTMLElement) {
                          closeButton.click();
                        }
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
      
      <Sheet>
        <SheetContent>
          <ParticipantsList chatParticipants={participants} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Chat;
