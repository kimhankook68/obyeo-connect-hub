
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ParticipantsListProps {
  chatId: string;
  currentChat: any;
  userId: string;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ chatId, currentChat, userId }) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const isCreator = currentChat?.creator_id === userId;

  useEffect(() => {
    fetchParticipants();
    fetchMembers();
  }, [chatId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("chat_participants")
        .select("*, profiles(id, email, name)")
        .eq("chat_id", chatId);

      if (error) throw error;
      setParticipants(data || []);
    } catch (error: any) {
      toast.error("참여자를 불러오는데 실패했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*");

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error("임직원 불러오기 실패:", error);
    }
  };

  const addParticipant = async (member: any) => {
    try {
      // Check if already a participant
      const isAlreadyParticipant = participants.some(
        p => p.profiles?.id === member.user_id
      );
      
      if (isAlreadyParticipant) {
        toast.error("이미 채팅방에 참여중인 사용자입니다.");
        return;
      }
      
      const { error } = await supabase
        .from("chat_participants")
        .insert({
          chat_id: chatId,
          user_id: member.user_id,
        });

      if (error) throw error;
      
      toast.success("참여자가 추가되었습니다.");
      fetchParticipants();
    } catch (error: any) {
      toast.error("참여자 추가에 실패했습니다: " + error.message);
    }
  };

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = member.name && member.name.toLowerCase().includes(searchLower);
    const emailMatch = member.email && member.email.toLowerCase().includes(searchLower);
    const departmentMatch = member.department && member.department.toLowerCase().includes(searchLower);
    return nameMatch || emailMatch || departmentMatch;
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">현재 참여자</h3>
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
              <div>
                {participant.profiles?.name || participant.profiles?.email || "Unknown User"}
              </div>
              {isCreator && participant.user_id !== userId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    // Remove participant logic
                  }}
                >
                  제거
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {isCreator && (
        <>
          <h3 className="text-lg font-medium mt-6">참여자 추가</h3>
          <Input
            placeholder="이름 또는 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {searchTerm ? "검색 결과가 없습니다." : "추가할 임직원이 없습니다."}
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div>
                    <div>{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addParticipant(member)}
                  >
                    추가
                  </Button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ParticipantsList;
