
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Member } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, User } from "lucide-react";

interface MembersListProps {
  members: Member[];
  onEditMember: (member: Member) => void;
  onDeleteMember: (member: Member) => void;
}

const MembersList = ({ members, onEditMember, onDeleteMember }: MembersListProps) => {
  const navigate = useNavigate();
  
  if (members.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">등록된 임직원이 없습니다.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>부서</TableHead>
              <TableHead>직책</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead className="w-[150px] text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.image || ""} />
                      <AvatarFallback>
                        {member.name ? member.name.substring(0, 2).toUpperCase() : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.name || "이름 없음"}</span>
                  </div>
                </TableCell>
                <TableCell>{member.email || "-"}</TableCell>
                <TableCell>{member.department || "-"}</TableCell>
                <TableCell>{member.role || "-"}</TableCell>
                <TableCell>{member.phone || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => navigate(`/profile?id=${member.id}`)}
                    >
                      <User className="h-4 w-4" />
                      <span className="sr-only">프로필</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEditMember(member)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">수정</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteMember(member)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">삭제</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MembersList;
