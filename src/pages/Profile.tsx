
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Building2, Mail, Phone, UserRound } from "lucide-react";
import { Member } from "@/types/member";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const memberId = queryParams.get('id');
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
      
      if (memberId) {
        fetchMemberById(memberId);
      } else if (data.session) {
        fetchMemberByUserId(data.session.user.id);
      } else {
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate, memberId]);
  
  const fetchMemberById = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      setMember(data);
      updateFormFields(data);
    } catch (error: any) {
      toast.error("프로필 정보를 불러오는데 실패했습니다.");
      navigate('/members');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchMemberByUserId = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setMember(data);
        updateFormFields(data);
      } else {
        toast.error("연결된 프로필이 없습니다.");
        navigate('/members');
      }
    } catch (error: any) {
      toast.error("프로필 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateFormFields = (data: Member) => {
    setName(data.name || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setDepartment(data.department || "");
    setRole(data.role || "");
  };
  
  const handleUpdate = async () => {
    if (!member) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('members')
        .update({
          name,
          email,
          phone,
          department,
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);
      
      if (error) throw error;
      
      toast.success("프로필이 업데이트 되었습니다.");
      setIsEditing(false);
      fetchMemberById(member.id);
    } catch (error: any) {
      toast.error("프로필 업데이트에 실패했습니다: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if current user is viewing their own profile
  const isOwnProfile = user && member && user.id === member.user_id;
  
  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <Header title="프로필" />
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!member) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <Header title="프로필" />
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-red-500 mb-4">프로필 정보를 찾을 수 없습니다.</p>
            <Button onClick={() => navigate('/members')}>
              임직원 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <Header title="프로필" />
        
        <div className="p-6 flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">프로필</h2>
              {isOwnProfile && !isEditing && (
                <Button onClick={() => setIsEditing(true)}>수정</Button>
              )}
              {isEditing && (
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    updateFormFields(member);
                  }}>취소</Button>
                  <Button onClick={handleUpdate}>저장</Button>
                </div>
              )}
            </div>
            
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
                    <CardTitle className="text-2xl">{member.name}</CardTitle>
                    <p className="text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">이름</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">이메일</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">연락처</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">부서</Label>
                      <Input 
                        id="department" 
                        value={department} 
                        onChange={(e) => setDepartment(e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">직책</Label>
                      <Input 
                        id="role" 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)} 
                      />
                    </div>
                  </div>
                ) : (
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
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  최종 수정일: {new Date(member.updated_at).toLocaleDateString('ko-KR')}
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/members')}>
                  목록으로
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
