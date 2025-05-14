
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Member } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, User } from "lucide-react";
import ProfileViewDialog from "./profile/ProfileViewDialog";

interface MembersListProps {
  members: Member[];
  isLoading?: boolean;
  onEditMember: (member: Member) => void;
  onDeleteMember: (member: Member) => void;
}

const MembersList = ({ members, isLoading, onEditMember, onDeleteMember }: MembersListProps) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const handleViewProfile = (member: Member) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">임직원 정보를 불러오는 중...</p>
      </div>
    );
  }
  
  if (members.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">등록된 임직원이 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col">
                <div className="bg-gray-50 p-4 flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.image || ""} />
                    <AvatarFallback>
                      {member.name ? member.name.substring(0, 2).toUpperCase() : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{member.name || "이름 없음"}</p>
                    <p className="text-sm text-muted-foreground">{member.role || "-"}</p>
                  </div>
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex flex-col space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">부서</span>
                      <span className="font-medium">{member.department || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">이메일</span>
                      <span className="font-medium">{member.email || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">연락처</span>
                      <span className="font-medium">{member.phone || "-"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t p-3 bg-gray-50 flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewProfile(member)}
                  >
                    <User className="h-4 w-4 mr-1" />
                    <span>프로필</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEditMember(member)}>
                    <Edit className="h-4 w-4 mr-1" />
                    <span>수정</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDeleteMember(member)}>
                    <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                    <span className="text-destructive">삭제</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <ProfileViewDialog 
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        profile={selectedMember}
      />
    </>
  );
};

export default MembersList;
