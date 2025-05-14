import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import MembersList from "@/components/MembersList";
import MemberFormDialog from "@/components/MemberFormDialog";
import MemberDeleteDialog from "@/components/MemberDeleteDialog";
import { Member } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMembers(data || []);
    } catch (error: any) {
      toast.error("임직원 정보를 불러오는데 실패했습니다: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setIsFormDialogOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsFormDialogOpen(true);
  };

  const handleDeleteMember = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setSelectedMember(null);
    fetchMembers();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
    fetchMembers();
  };

  const filteredMembers = members.filter((member) => {
    const searchRegex = new RegExp(searchQuery, 'i');
    return (
      searchRegex.test(member.name) ||
      searchRegex.test(member.department) ||
      searchRegex.test(member.role)
    );
  });

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <Header>임직원 관리</Header>
        
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="이름, 부서, 직책으로 검색"
                  className="w-full pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Button onClick={() => handleAddMember()}>
              <Plus className="mr-2 h-4 w-4" />
              임직원 추가
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <MembersList 
              members={filteredMembers} 
              onEditMember={handleEditMember} 
              onDeleteMember={handleDeleteMember} 
            />
          )}
        </div>
        
        <MemberFormDialog
          isOpen={isFormDialogOpen}
          onClose={() => setIsFormDialogOpen(false)}
          memberToEdit={selectedMember}
          onSuccess={handleFormSuccess}
        />
        
        <MemberDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          member={selectedMember}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  );
};

export default Members;
