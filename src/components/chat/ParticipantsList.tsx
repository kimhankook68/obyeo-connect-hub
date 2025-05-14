
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ParticipantsListProps {
  chatParticipants: any[];
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ chatParticipants }) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">참여자 목록</h2>
      
      {chatParticipants.length === 0 ? (
        <p className="text-muted-foreground">참여자가 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {chatParticipants.map((participant) => (
            <li key={participant.id} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {participant.user_id.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{participant.user_id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParticipantsList;
