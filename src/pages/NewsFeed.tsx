
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import NewsFeed from "@/components/dashboard/NewsFeed";

const NewsFeedPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="뉴스피드" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">뉴스피드</h1>
            <p className="text-muted-foreground">동료들과 소식을 공유하세요.</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <NewsFeed limit={20} showViewMoreButton={false} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewsFeedPage;
