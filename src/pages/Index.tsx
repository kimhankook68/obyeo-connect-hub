
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import StatCards from "@/components/dashboard/StatCards";
import RecentNotices from "@/components/dashboard/RecentNotices";
import RecentDocuments from "@/components/dashboard/RecentDocuments";
import RecentPosts from "@/components/dashboard/UpcomingEvents";
import WeeklyCalendar from "@/components/dashboard/WeeklyCalendar";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    fetchUser();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="대시보드" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">
              안녕하세요, {user?.user_metadata?.name || user?.email?.split('@')[0] || '방문자'}님!
            </h1>
            <p className="text-muted-foreground">오늘도 좋은 하루 되세요.</p>
          </div>
          
          <StatCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RecentNotices />
            <RecentDocuments />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RecentPosts />
            <WeeklyCalendar />
          </div>
          
          <footer className="mt-auto pt-4 border-t border-border text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} 사회복지법인 오병이어복지재단 All Rights Reserved.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
