
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProfileLoading = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <Button variant="outline" onClick={() => navigate('/members')}>
        목록으로
      </Button>
    </div>
  );
};

export default ProfileLoading;
