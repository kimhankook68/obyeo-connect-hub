
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { toast } from "sonner";
import { Member } from "@/types/member";
import ProfileView from "@/components/profile/ProfileView";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import ProfileLoading from "@/components/profile/ProfileLoading";
import ProfileNotFound from "@/components/profile/ProfileNotFound";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const memberId = queryParams.get('id');
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
      
      if (memberId) {
        fetchMemberById(memberId);
      } else if (data.session) {
        fetchMemberByUserId(data.session.user.id);
      } else {
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate, memberId]);
  
  const fetchMemberById = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      setMember(data);
      updateFormFields(data);
    } catch (error: any) {
      toast.error("프로필 정보를 불러오는데 실패했습니다.");
      navigate('/members');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchMemberByUserId = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setMember(data);
        updateFormFields(data);
      } else {
        toast.error("연결된 프로필이 없습니다.");
        navigate('/members');
      }
    } catch (error: any) {
      toast.error("프로필 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateFormFields = (data: Member) => {
    setName(data.name || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setDepartment(data.department || "");
    setRole(data.role || "");
  };
  
  const handleUpdate = async () => {
    if (!member) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('members')
        .update({
          name,
          email,
          phone,
          department,
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);
      
      if (error) throw error;
      
      toast.success("프로필이 업데이트 되었습니다.");
      setIsEditing(false);
      fetchMemberById(member.id);
    } catch (error: any) {
      toast.error("프로필 업데이트에 실패했습니다: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if current user is viewing their own profile
  const isOwnProfile = user && member && user.id === member.user_id;
  
  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "department":
        setDepartment(value);
        break;
      case "role":
        setRole(value);
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <Header>프로필</Header>
        
        <div className="p-6 flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto">
            {isLoading ? (
              <ProfileLoading />
            ) : !member ? (
              <ProfileNotFound />
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">프로필</h2>
                </div>
                
                {isEditing ? (
                  <ProfileEditForm
                    member={member}
                    formData={{ name, email, phone, department, role }}
                    onCancel={() => {
                      setIsEditing(false);
                      updateFormFields(member);
                    }}
                    onSave={handleUpdate}
                    onChange={handleFieldChange}
                  />
                ) : (
                  <ProfileView
                    member={member}
                    isOwnProfile={isOwnProfile}
                    onEdit={() => setIsEditing(true)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
