
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const SurveyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("surveys")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setSurvey(data);
      } catch (error) {
        console.error("설문 가져오기 실패:", error);
        toast({
          title: "설문 로드 실패",
          description: "설문 정보를 불러오는 데 실패했습니다.",
          variant: "destructive",
        });
        navigate("/surveys");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSurvey();
    }
  }, [id, navigate, toast]);

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={loading ? "설문조사" : survey?.title} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl">
              <div className="p-6 border rounded-lg">
                <h1 className="text-2xl font-semibold mb-4">{survey.title}</h1>
                {survey.description && (
                  <p className="text-muted-foreground mb-6">{survey.description}</p>
                )}
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <span className="font-medium">생성일:</span>
                    <span>{new Date(survey.created_at).toLocaleDateString()}</span>
                  </div>
                  {survey.end_date && (
                    <div className="flex gap-2">
                      <span className="font-medium">마감일:</span>
                      <span>{new Date(survey.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center py-8">
                <p className="text-muted-foreground">설문 항목과 응답 기능은 현재 개발 중입니다.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SurveyDetail;
