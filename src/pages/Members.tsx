
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberFormDialog } from "@/components/MemberFormDialog";
import { Member } from "@/types/member";

const fetchMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("name");

  if (error) {
    console.error("회원 정보 조회 오류:", error);
    throw new Error(error.message);
  }

  return data || [];
};

const Members = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  
  // 임직원 편집 상태 관리
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const { data: members, isLoading, error, refetch } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const filteredMembers = members?.filter((member) =>
    (member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddNewMember = () => {
    setEditingMember(null); // 새 임직원 등록 모드
    setIsFormDialogOpen(true);
  };

  const handleFormDialogClose = () => {
    setIsFormDialogOpen(false);
    setEditingMember(null);
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">구성원</h1>
              <div className="flex items-center space-x-2">
                <div className="relative w-64">
                  <Input
                    placeholder="이름 또는 이메일로 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                
                <Button onClick={handleAddNewMember}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  구성원 추가
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">재단의 구성원 정보를 확인하세요.</p>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
                사용자 정보를 불러오는 중 오류가 발생했습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMembers?.map((member) => (
                  <Card key={member.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center mb-4">
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage src={member.image || ""} />
                          <AvatarFallback className="text-2xl">
                            {member.name ? member.name.substring(0, 2).toUpperCase() : "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-medium">{member.name || "이름 없음"}</h3>
                          <p className="text-muted-foreground">{member.department} · {member.role}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4 mt-6">
                        <div className="flex items-center gap-2">
                          <span className="i-lucide-mail text-muted-foreground flex-shrink-0" />
                          <a href={`mailto:${member.email}`} className="text-sm hover:underline truncate">
                            {member.email}
                          </a>
                        </div>
                        
                        {member.phone && (
                          <div className="flex items-center gap-2">
                            <span className="i-lucide-phone text-muted-foreground flex-shrink-0" />
                            <a href={`tel:${member.phone}`} className="text-sm hover:underline">
                              {member.phone}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-6"
                        onClick={() => {
                          // Handle profile view navigation
                          window.location.href = `/profile?id=${member.id}`;
                        }}
                      >
                        프로필 보기
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredMembers?.length === 0 && !isLoading && (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <p className="text-muted-foreground">검색 결과가 없습니다.</p>
              </div>
            )}
            
            {/* 임직원 등록/편집 다이얼로그 */}
            <MemberFormDialog 
              open={isFormDialogOpen}
              onOpenChange={handleFormDialogClose}
              onSuccess={() => refetch()}
              editMember={editingMember || undefined}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Members;
