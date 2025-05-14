
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProfileNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-lg text-red-500 mb-4">프로필 정보를 찾을 수 없습니다.</p>
      <Button onClick={() => navigate('/members')}>
        임직원 목록으로 돌아가기
      </Button>
    </div>
  );
};

export default ProfileNotFound;
