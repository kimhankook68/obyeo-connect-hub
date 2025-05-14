
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ProfileView from "@/components/profile/ProfileView";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import ProfileLoading from "@/components/profile/ProfileLoading";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit3, ChevronLeft } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  department?: string;
  phone?: string;
  image?: string;
  updated_at?: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        // 로그인 사용자 정보 가져오기
        const { data: userData } = await supabase.auth.getUser();
        setUser(userData.user);

        // 프로필 정보 가져오기 (실제로는 URL 파라미터나 다른 방식으로 다른 사람의 프로필도 볼 수 있게 할 수 있음)
        if (userData.user) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userData.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          setProfile(profileData || { id: userData.user.id, email: userData.user.email });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('프로필 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, []);

  const handleSaveProfile = async (updatedProfile: Partial<Profile>) => {
    if (!user) return;
    
    try {
      // 기존 프로필이 없으면 생성, 있으면 업데이트
      const { error } = profile && profile.updated_at 
        ? await supabase
            .from('profiles')
            .update(updatedProfile)
            .eq('id', user.id)
        : await supabase
            .from('profiles')
            .insert([{ ...updatedProfile, id: user.id }]);

      if (error) throw error;

      // 업데이트된 프로필 정보 다시 로드
      const { data: refreshedProfile, error: refreshError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (refreshError) throw refreshError;

      setProfile(refreshedProfile);
      setEditing(false);
      toast.success('프로필이 업데이트되었습니다.');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('프로필 업데이트에 실패했습니다.');
    }
  };

  const handleGoBack = () => {
    if (editing) {
      setEditing(false);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="내 프로필" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoBack}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {editing ? '취소' : '돌아가기'}
              </Button>
              
              {!editing && !loading && profile && (
                <Button 
                  onClick={() => setEditing(true)}
                  variant="outline"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  프로필 수정
                </Button>
              )}
            </div>

            {loading ? (
              <ProfileLoading />
            ) : !profile ? (
              <ProfileNotFound />
            ) : editing ? (
              <ProfileEditForm 
                profile={profile} 
                onSubmit={handleSaveProfile} 
                onCancel={() => setEditing(false)} 
              />
            ) : (
              <ProfileView profile={profile} isOwnProfile={true} onEdit={() => setEditing(true)} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
