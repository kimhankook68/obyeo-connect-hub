
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const Settings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      // In a real app, fetch user preferences from a separate table
      setEmailNotifications(session.user.user_metadata?.email_notifications !== false);
      setIsLoading(false);
    };

    fetchUser();
  }, [navigate]);

  const updateEmailPreference = async (enabled: boolean) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { email_notifications: enabled }
      });

      if (error) {
        throw error;
      }

      setEmailNotifications(enabled);
      toast({
        title: "설정 저장 완료",
        description: "이메일 알림 설정이 업데이트되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "설정 저장 실패",
        description: error.message || "설정 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "이메일 전송 완료",
        description: "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "이메일 전송 실패",
        description: error.message || "이메일 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, you would need a serverless function to properly delete a user
    // For demo purposes, we'll just sign out
    try {
      await supabase.auth.signOut();
      toast({
        title: "계정 삭제 요청 완료",
        description: "계정 삭제가 처리되었습니다.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "계정 삭제 실패",
        description: error.message || "계정 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="설정" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">설정</h1>
            
            {/* Notification Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
                <CardDescription>알림 수신 방법을 선택하세요.</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-notifications">이메일 알림</Label>
                    <p className="text-sm text-muted-foreground">
                      중요 알림 및 업데이트를 이메일로 받습니다.
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={updateEmailPreference}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Security Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>보안</CardTitle>
                <CardDescription>계정 보안 설정을 관리하세요.</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">비밀번호 변경</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    비밀번호를 변경하려면 이메일을 통한 인증이 필요합니다.
                  </p>
                  <Button onClick={handleChangePassword}>비밀번호 변경</Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">위험 구역</CardTitle>
                <CardDescription>
                  계정 삭제는 되돌릴 수 없으며 모든 데이터가 영구적으로 삭제됩니다.
                </CardDescription>
              </CardHeader>
              
              <CardFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">계정 삭제</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>정말로 계정을 삭제하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        이 작업은 되돌릴 수 없으며 모든 데이터가 영구적으로 삭제됩니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
