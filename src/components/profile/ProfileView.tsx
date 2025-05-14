
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Building2, Mail, Phone, UserRound } from "lucide-react";
import { Member } from "@/types/member";
import { useNavigate } from "react-router-dom";

interface ProfileViewProps {
  member: Member;
  isOwnProfile: boolean;
  onEdit: () => void;
}

const ProfileView = ({ member, isOwnProfile, onEdit }: ProfileViewProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={member.image || ""} />
            <AvatarFallback>
              {member.name ? member.name.substring(0, 2).toUpperCase() : "??"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{member.name}</CardTitle>
            <p className="text-muted-foreground">{member.role}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <UserRound className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">이름</p>
                <p>{member.name || "-"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">이메일</p>
                <p>{member.email || "-"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">연락처</p>
                <p>{member.phone || "-"}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">부서</p>
                <p>{member.department || "-"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <UserRound className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">직책</p>
                <p>{member.role || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          최종 수정일: {new Date(member.created_at).toLocaleDateString('ko-KR')}
        </div>
        <div className="flex gap-2">
          {isOwnProfile && (
            <Button onClick={onEdit}>수정</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate('/members')}>
            목록으로
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProfileView;
