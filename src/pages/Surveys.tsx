
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "../components/ui/use-toast";

const Surveys = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSurveys(data || []);
    } catch (error) {
      console.error("설문 가져오기 실패:", error);
      toast({
        title: "설문 로드 실패",
        description: "설문 목록을 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="설문조사" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">설문조사</h1>
            <Button onClick={() => navigate("/surveys/create")}>
              <PlusIcon className="h-4 w-4 mr-2" />
              새 설문 작성
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground mb-4">아직 설문이 없습니다.</p>
              <Button onClick={() => navigate("/surveys/create")}>
                새 설문 작성하기
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/surveys/${survey.id}`)}
                >
                  <h2 className="font-medium text-lg mb-1">{survey.title}</h2>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {survey.description}
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>생성일: {new Date(survey.created_at).toLocaleDateString()}</span>
                    <span>마감일: {survey.end_date ? new Date(survey.end_date).toLocaleDateString() : '무기한'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Surveys;
