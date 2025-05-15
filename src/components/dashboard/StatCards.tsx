
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BookmarkIcon, CalendarIcon, FileTextIcon, UsersIcon } from "lucide-react";

const StatCards = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingTasks: 0,
    todayEvents: 0,
    newMessages: 0,
    totalMembers: 0
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch today's events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const { count: eventsCount, error: eventsError } = await supabase
          .from('calendar_events')
          .select('*', { count: 'exact', head: true })
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString());
        
        if (eventsError) throw eventsError;
        
        // Fetch total members
        const { count: membersCount, error: membersError } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true });
          
        if (membersError) throw membersError;
        
        // Fetch active surveys
        const { count: surveysCount, error: surveysError } = await supabase
          .from('surveys')
          .select('*', { count: 'exact', head: true })
          .is('end_date', null)
          .or('end_date.gte.' + new Date().toISOString());
          
        if (surveysError) console.error(surveysError);
        
        // Fetch bookmarks count
        const { count: bookmarksCount, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('*', { count: 'exact', head: true });
          
        if (bookmarksError) console.error(bookmarksError);
        
        setStats({
          pendingTasks: surveysCount || 0,
          todayEvents: eventsCount || 0,
          newMessages: bookmarksCount || 0, // Use bookmarks count for the third card
          totalMembers: membersCount || 0
        });
        
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    fetchStats();
  }, []);

  const cards = [
    { 
      title: "진행 중인 설문", 
      count: stats.pendingTasks, 
      icon: <FileTextIcon className="w-6 h-6 text-blue-500" />,
      color: "bg-blue-50",
      iconColor: "text-blue-500",
      link: "/surveys",
      linkText: "모두 보기"
    },
    { 
      title: "오늘 일정", 
      count: stats.todayEvents, 
      icon: <CalendarIcon className="w-6 h-6 text-green-500" />,
      color: "bg-green-50",
      iconColor: "text-green-500",
      link: "/calendar",
      linkText: "달력 보기"
    },
    { 
      title: "즐겨찾기", 
      count: stats.newMessages, 
      icon: <BookmarkIcon className="w-6 h-6 text-purple-500" />,
      color: "bg-purple-50",
      iconColor: "text-purple-500",
      link: "/bookmarks",
      linkText: "전체 보기"
    },
    { 
      title: "활동 직원", 
      count: stats.totalMembers, 
      icon: <UsersIcon className="w-6 h-6 text-amber-500" />,
      color: "bg-amber-50",
      iconColor: "text-amber-500",
      link: "/members",
      linkText: "직원 목록"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div 
          key={index}
          className={`p-6 rounded-lg border border-border shadow-sm ${card.color} cursor-pointer transition-all hover:shadow-md`}
          onClick={() => navigate(card.link)}
        >
          <div className="flex flex-col items-start">
            <div className={`mb-2 ${card.iconColor}`}>{card.icon}</div>
            <div className="text-sm text-muted-foreground mb-1">{card.title}</div>
            <div className="text-2xl font-semibold mb-2">{card.count}개</div>
            <button 
              className="text-blue-500 text-sm hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(card.link);
              }}
            >
              {card.linkText}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
