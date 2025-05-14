
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
        
        setStats({
          pendingTasks: surveysCount || 0, // Use surveys count for pending tasks
          todayEvents: eventsCount || 0,
          newMessages: 0, // Placeholder for messages
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
      icon: "📄",
      color: "bg-blue-50",
      iconColor: "text-blue-500",
      link: "/surveys",
      linkText: "모두 보기"
    },
    { 
      title: "오늘 일정", 
      count: stats.todayEvents, 
      icon: "📅",
      color: "bg-green-50",
      iconColor: "text-green-500",
      link: "/calendar",
      linkText: "달력 보기"
    },
    { 
      title: "새 메시지", 
      count: stats.newMessages, 
      icon: "💬",
      color: "bg-purple-50",
      iconColor: "text-purple-500",
      link: "/surveys",
      linkText: "메시지함 열기"
    },
    { 
      title: "활동 직원", 
      count: stats.totalMembers, 
      icon: "👥",
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
          className={`p-6 rounded-lg border border-border shadow-sm ${card.color} cursor-pointer`}
          onClick={() => navigate(card.link)}
        >
          <div className="flex flex-col items-start">
            <div className={`text-2xl mb-2 ${card.iconColor}`}>{card.icon}</div>
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
