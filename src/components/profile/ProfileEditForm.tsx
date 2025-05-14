
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileEditFormProps {
  profile: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    department?: string;
    phone?: string;
    image?: string;
    updated_at?: string;
  };
  onSubmit: (updatedProfile: any) => void;
  onCancel: () => void;
}

const ProfileEditForm = ({ profile, onSubmit, onCancel }: ProfileEditFormProps) => {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    department: profile.department || "",
    role: profile.role || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

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
            <CardTitle>{profile.name}</CardTitle>
            <p className="text-muted-foreground">{profile.role}</p>
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
              onChange={(e) => handleChange("name", e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input 
              id="email" 
              type="email" 
              value={formData.email} 
              onChange={(e) => handleChange("email", e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="phone">연락처</Label>
            <Input 
              id="phone" 
              value={formData.phone} 
              onChange={(e) => handleChange("phone", e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="department">부서</Label>
            <Input 
              id="department" 
              value={formData.department} 
              onChange={(e) => handleChange("department", e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="role">직책</Label>
            <Input 
              id="role" 
              value={formData.role} 
              onChange={(e) => handleChange("role", e.target.value)} 
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          최종 수정일: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('ko-KR') : "-"}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>취소</Button>
          <Button onClick={handleSubmit}>저장</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProfileEditForm;
