
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Building2, Mail, Phone, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    user_id?: string;
  } | null;
}

const ProfileViewDialog = ({ open, onOpenChange, profile }: ProfileViewDialogProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // 현재 로그인한 사용자의 정보 확인
    const checkCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        
        // 사용자의 역할 확인
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        // 관리자 여부 확인
        setIsAdmin(profileData?.role?.toLowerCase() === 'admin');
      }
    };
    
    if (open) {
      checkCurrentUser();
    }
  }, [open]);
  
  if (!profile) return null;
  
  // 본인 또는 관리자인지 확인
  const isOwnProfile = profile.user_id === currentUserId;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.image || ""} />
              <AvatarFallback>
                {profile.name ? profile.name.substring(0, 2).toUpperCase() : "??"}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{profile.name || "이름 없음"}</DialogTitle>
              <p className="text-muted-foreground">{profile.role || "직책 정보 없음"}</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
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
          
          <div className="text-xs text-muted-foreground text-right">
            최종 수정일: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('ko-KR') : "-"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileViewDialog;
