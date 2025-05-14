
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import MembersList from "@/components/MembersList";
import { MemberFormDialog } from "@/components/MemberFormDialog";
import { MemberDeleteDialog } from "@/components/MemberDeleteDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PlusIcon, Search } from "lucide-react";
import { Member } from "@/types/member";

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*");

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast.error("멤버 데이터를 불러오는데 실패했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (member: Omit<Member, "id">) => {
    try {
      const { data, error } = await supabase
        .from("members")
        .insert([member])
        .select();

      if (error) throw error;
      setMembers([...members, data[0]]);
      toast.success("멤버가 추가되었습니다.");
    } catch (error: any) {
      toast.error("멤버 추가에 실패했습니다.");
      console.error(error);
    } finally {
      setIsFormOpen(false);
    }
  };

  const handleEditMember = async (member: Member) => {
    try {
      const { error } = await supabase
        .from("members")
        .update(member)
        .eq("id", member.id);

      if (error) throw error;
      
      setMembers(members.map(m => m.id === member.id ? member : m));
      toast.success("멤버 정보가 수정되었습니다.");
    } catch (error: any) {
      toast.error("멤버 정보 수정에 실패했습니다.");
      console.error(error);
    } finally {
      setSelectedMember(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    
    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", selectedMember.id);

      if (error) throw error;
      
      setMembers(members.filter(m => m.id !== selectedMember.id));
      toast.success("멤버가 삭제되었습니다.");
    } catch (error: any) {
      toast.error("멤버 삭제에 실패했습니다.");
      console.error(error);
    } finally {
      setSelectedMember(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const filteredMembers = members.filter(member => {
    return !searchTerm || 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="임직원 관리" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 부서, 직책으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4"
              />
            </div>
            <Button onClick={() => {
              setSelectedMember(null);
              setIsFormOpen(true);
            }}>
              <PlusIcon className="h-4 w-4 mr-2" />
              새 임직원
            </Button>
          </div>

          <MembersList
            members={filteredMembers}
            isLoading={isLoading}
            onEditMember={(member) => {
              setSelectedMember(member);
              setIsFormOpen(true);
            }}
            onDeleteMember={(member) => {
              setSelectedMember(member);
              setIsDeleteDialogOpen(true);
            }}
          />

          <MemberFormDialog
            open={isFormOpen}
            editMember={selectedMember}
            onOpenChange={setIsFormOpen}
            onSuccess={fetchMembers}
          />

          <MemberDeleteDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            memberId={selectedMember?.id || null}
            memberName={selectedMember?.name || null}
            onSuccess={fetchMembers}
          />
        </main>
      </div>
    </div>
  );
};

export default Members;
