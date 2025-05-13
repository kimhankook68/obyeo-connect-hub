
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  {
    name: "대시보드",
    path: "/",
    icon: "📊"
  },
  {
    name: "공지사항",
    path: "/notices",
    icon: "📣"
  },
  {
    name: "일정관리",
    path: "/calendar",
    icon: "📅"
  },
  {
    name: "자료실",
    path: "/documents",
    icon: "📁"
  },
  {
    name: "임직원",
    path: "/members",
    icon: "👥"
  },
  {
    name: "이사회",
    path: "/board-meetings",
    icon: "🏢"
  }
];

const Sidebar = ({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (value: boolean) => void }) => {
  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-border transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
            {collapsed ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-500 text-white text-xl font-bold">
                오
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-500 text-white text-xl font-bold">
                  오
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
                    <span className="text-xl mr-3">{item.icon}</span>
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
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
