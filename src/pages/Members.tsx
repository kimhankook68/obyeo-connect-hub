
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MembersList from "@/components/MembersList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Define the Member type based on our database structure
export type Member = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  phone?: string | null;
  image?: string | null;
  created_at: string;
};

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

  const { data: members, isLoading, error } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const filteredMembers = members?.filter((member) =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">임직원 관리</h1>
              <div className="relative w-64">
                <Input
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
                사용자 정보를 불러오는 중 오류가 발생했습니다.
              </div>
            ) : (
              <MembersList members={filteredMembers || []} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Members;
