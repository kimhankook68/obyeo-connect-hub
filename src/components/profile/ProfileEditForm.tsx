
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Member } from "@/types/member";

interface ProfileEditFormProps {
  member: Member;
  formData: {
    name: string;
    email: string;
    phone: string;
    department: string;
    role: string;
  };
  onCancel: () => void;
  onSave: () => void;
  onChange: (field: string, value: string) => void;
}

const ProfileEditForm = ({ 
  member,
  formData, 
  onCancel, 
  onSave, 
  onChange 
}: ProfileEditFormProps) => {
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
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">이름</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => onChange("name", e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input 
              id="email" 
              type="email" 
              value={formData.email} 
              onChange={(e) => onChange("email", e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="phone">연락처</Label>
            <Input 
              id="phone" 
              value={formData.phone} 
              onChange={(e) => onChange("phone", e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="department">부서</Label>
            <Input 
              id="department" 
              value={formData.department} 
              onChange={(e) => onChange("department", e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="role">직책</Label>
            <Input 
              id="role" 
              value={formData.role} 
              onChange={(e) => onChange("role", e.target.value)} 
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          최종 수정일: {new Date(member.created_at).toLocaleDateString('ko-KR')}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>취소</Button>
          <Button onClick={onSave}>저장</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProfileEditForm;
