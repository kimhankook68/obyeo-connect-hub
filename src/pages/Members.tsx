
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MembersList from "@/components/MembersList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Filter, MoreVertical, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [filterByDepartment, setFilterByDepartment] = useState("");

  const { data: members, isLoading, error } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const filteredMembers = members?.filter((member) =>
    (member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchQuery.toLowerCase())) && 
    (filterByDepartment ? member.department === filterByDepartment : true)
  );

  const departments = members ? [...new Set(members.map(member => member.department))].filter(Boolean) : [];

  const handleExportCSV = () => {
    if (!members) return;

    const headers = ["이름", "이메일", "부서", "직책", "전화번호"];
    const csvData = members.map(member => [
      member.name || "",
      member.email || "",
      member.department || "",
      member.role || "",
      member.phone || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "임직원_목록.csv";
    link.click();
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">임직원 관리</h1>
              <div className="flex items-center space-x-2">
                <div className="relative w-64">
                  <Input
                    placeholder="검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>부서별 필터링</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterByDepartment("")}>
                      모든 부서
                    </DropdownMenuItem>
                    {departments.map((dept) => (
                      <DropdownMenuItem 
                        key={dept} 
                        onClick={() => setFilterByDepartment(dept)}
                      >
                        {dept}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      CSV 내보내기
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  임직원 등록
                </Button>
              </div>
            </div>

            {filterByDepartment && (
              <div className="mb-4">
                <div className="inline-flex items-center bg-secondary px-3 py-1 rounded-md text-sm">
                  <span className="mr-2">부서 필터:</span>
                  <span className="font-medium">{filterByDepartment}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 p-0 ml-2" 
                    onClick={() => setFilterByDepartment("")}
                  >
                    <span className="sr-only">삭제</span>
                    ✕
                  </Button>
                </div>
              </div>
            )}
            
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
