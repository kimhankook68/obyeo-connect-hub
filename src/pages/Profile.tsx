
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Member } from "@/types/member";

const profileSchema = z.object({
  name: z.string().min(2, {
    message: "이름은 최소 2자 이상이어야 합니다.",
  }),
  email: z.string().email({
    message: "유효한 이메일 주소를 입력해주세요.",
  }).optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Member | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [searchParams] = useSearchParams();
  const profileId = searchParams.get("id");
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      role: "",
      phone: "",
    },
  });

  // Fetch user session and profile data
  useEffect(() => {
    const fetchData = async () => {
      // First get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      
      let profileToFetch = profileId || session.user.id;
      
      // Check if this is user's own profile
      setIsOwnProfile(profileToFetch === session.user.id);
      
      // Fetch the profile data
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileToFetch)
        .single();
      
      if (error) {
        toast({
          title: "프로필 조회 실패",
          description: "프로필 정보를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
        return;
      }
      
      setProfile(data);
      
      // Set form values
      form.setValue("name", data.name || "");
      form.setValue("email", data.email || "");
      form.setValue("department", data.department || "");
      form.setValue("role", data.role || "");
      form.setValue("phone", data.phone || "");
    };

    fetchData();
  }, [navigate, form, profileId, toast]);

  const onSubmit = async (data: ProfileFormValues) => {
    // Only allow editing own profile
    if (!isOwnProfile) {
      toast({
        title: "권한 없음",
        description: "자신의 프로필만 수정할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          department: data.department,
          role: data.role,
          phone: data.phone
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "프로필 업데이트 성공",
        description: "프로필이 성공적으로 업데이트되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "프로필 업데이트 실패",
        description: error.message || "프로필 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) {
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
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">프로필</h1>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.image || ""} />
                    <AvatarFallback className="text-lg">
                      {profile.name ? profile.name.substring(0, 2).toUpperCase() : profile.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{profile.name || profile.email?.split('@')[0] || '사용자'}</CardTitle>
                    <CardDescription>{profile.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>이름</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isOwnProfile} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>이메일</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>부서</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isOwnProfile} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>직책</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isOwnProfile} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>연락처</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isOwnProfile} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {isOwnProfile && (
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "저장 중..." : "저장하기"}
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
              
              {isOwnProfile && (
                <CardFooter className="flex flex-col items-start gap-2 border-t p-6">
                  <h3 className="text-lg font-medium">계정 관리</h3>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/settings")}
                  >
                    계정 설정
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
