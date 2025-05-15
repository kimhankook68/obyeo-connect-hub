import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { DashboardCard } from "@/components/DashboardCard";
import FileUploader from "@/components/FileUploader";
import DocumentsList from "@/components/DocumentsList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const DocumentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const documentId = searchParams.get('document');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const { toast } = useToast();
  
  useEffect(() => {
    // If a document ID is provided in the URL, ensure we're on the list tab
    if (documentId) {
      setActiveTab('list');
    }
  }, [documentId]);

  const handleUploadSuccess = () => {
    setActiveTab('list');
    // 목록을 새로고침하기 위해 DocumentsList를 리렌더링
    toast({
      title: "파일이 업로드되었습니다",
      description: "자료실 목록이 업데이트되었습니다",
    });
    
    // Clear document from URL if it exists
    if (searchParams.has('document')) {
      searchParams.delete('document');
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="자료실" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">자료실</h1>
            <p className="text-muted-foreground">필요한 자료를 업로드하고 관리하세요</p>
          </div>
          
          <div className="mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="list">자료 목록</TabsTrigger>
                <TabsTrigger value="upload">파일 업로드</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="mt-4">
                <DashboardCard title="자료 목록" action={
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('upload')}>
                    파일 업로드
                  </Button>
                }>
                  <DocumentsList />
                </DashboardCard>
              </TabsContent>
              
              <TabsContent value="upload" className="mt-4">
                <DashboardCard title="파일 업로드">
                  <FileUploader onSuccess={handleUploadSuccess} />
                </DashboardCard>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocumentsPage;
