
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Megaphone, 
  CalendarIcon, 
  FolderOpen, 
  FileText, 
  MessageSquare, 
  Users, 
  BookmarkIcon,
  ReceiptIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import MiniCalendar from "@/components/sidebar/MiniCalendar";

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: "대시보드",
    path: "/",
    icon: <LayoutDashboard size={20} />
  },
  {
    name: "공지사항",
    path: "/notices",
    icon: <Megaphone size={20} />
  },
  {
    name: "일정관리",
    path: "/calendar",
    icon: <CalendarIcon size={20} />
  },
  {
    name: "자료실",
    path: "/documents",
    icon: <FolderOpen size={20} />
  },
  {
    name: "설문조사",
    path: "/surveys",
    icon: <FileText size={20} />
  },
  {
    name: "자유게시판",
    path: "/freeboards",
    icon: <MessageSquare size={20} />
  },
  {
    name: "기부금영수증",
    path: "/donation-receipts",
    icon: <ReceiptIcon size={20} />
  },
  {
    name: "즐겨찾기",
    path: "/bookmarks",
    icon: <BookmarkIcon size={20} />
  },
  {
    name: "임직원",
    path: "/members",
    icon: <Users size={20} />
  }
];

const Sidebar = ({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (value: boolean) => void }) => {
  const navigate = useNavigate();
  
  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-border transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
            {collapsed ? (
              <div className="w-10 h-10 overflow-hidden">
                <AspectRatio ratio={1} className="rounded-lg">
                  <img 
                    src="/lovable-uploads/7277f3f3-7135-4f66-b425-c99df62252b0.png" 
                    alt="오병이어복지재단 로고" 
                    className="w-full h-full object-contain"
                  />
                </AspectRatio>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 overflow-hidden">
                  <AspectRatio ratio={1} className="rounded-lg">
                    <img 
                      src="/lovable-uploads/7277f3f3-7135-4f66-b425-c99df62252b0.png" 
                      alt="오병이어복지재단 로고" 
                      className="w-full h-full object-contain"
                    />
                  </AspectRatio>
                </div>
                <div className="font-semibold text-sm">오병이어복지재단</div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn("text-muted-foreground hover:text-foreground", collapsed && "hidden")}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>
        
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <nav className="flex-1 px-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                        collapsed && "justify-center"
                      )
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* 미니 캘린더 - 축소된 사이드바일 때는 표시하지 않음 */}
        {!collapsed && <MiniCalendar />}
        
        <div className={cn("p-4 border-t border-border", collapsed ? "flex justify-center" : "")}>
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground">
            {collapsed ? "→" : "←"}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
