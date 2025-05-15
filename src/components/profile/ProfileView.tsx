
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Building2, Mail, Phone, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProfileViewProps {
  profile: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    department?: string;
    phone?: string;
    image?: string;
    updated_at?: string;
    created_at?: string;
  };
  isOwnProfile: boolean;
  onEdit?: () => void;
  isAdmin?: boolean;
}

const ProfileView = ({ profile, isOwnProfile, onEdit, isAdmin = false }: ProfileViewProps) => {
  const navigate = useNavigate();
  
  // 본인 또는 관리자인 경우에만 수정 가능
  const canEdit = isOwnProfile || isAdmin;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.image || ""} />
            <AvatarFallback>
              {profile.name ? profile.name.substring(0, 2).toUpperCase() : "??"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{profile.name || "이름 없음"}</CardTitle>
            <p className="text-muted-foreground">{profile.role || "직책 정보 없음"}</p>
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
                <p>{profile.name || "-"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">이메일</p>
                <p>{profile.email || "-"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">연락처</p>
                <p>{profile.phone || "-"}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">부서</p>
                <p>{profile.department || "-"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <UserRound className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">직책</p>
                <p>{profile.role || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          최종 수정일: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('ko-KR') : "-"}
        </div>
        <div className="flex gap-2">
          {(canEdit && onEdit) && (
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
