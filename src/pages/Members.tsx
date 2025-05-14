
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, Building2, Search, UserRound } from "lucide-react";
import { Member } from "@/types/member";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Members = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("department", { ascending: true });

      if (error) {
        toast.error("임직원 정보를 불러오는데 실패했습니다.");
        throw error;
      }
      
      return data as Member[];
    },
  });
  
  // Extract unique departments for filtering
  const departments = Array.from(new Set(members.map(member => member.department)));
  
  // Filter members based on search query and department filter
  const filteredMembers = members.filter(member => {
    // Department filter
    if (departmentFilter && member.department !== departmentFilter) {
      return false;
    }
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.department?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="임직원" />
        
        <div className="p-6 flex-1 overflow-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold">임직원 관리</h1>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="mb-6 overflow-x-auto">
            <Tabs value={departmentFilter || "all"} onValueChange={(v) => setDepartmentFilter(v === "all" ? null : v)}>
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                {departments.map((dept) => (
                  <TabsTrigger key={dept} value={dept || ""}>
                    {dept}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-4 p-4 border-b">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={member.image || ""} />
                          <AvatarFallback>
                            {member.name ? member.name.substring(0, 2).toUpperCase() : "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{member.department || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{member.email || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{member.phone || "-"}</span>
                        </div>
                      </div>
                      <div className="p-4 pt-0 flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2"
                          onClick={() => navigate(`/profile?id=${member.id}`)}
                        >
                          <UserRound className="h-4 w-4" />
                          프로필 보기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Members;
