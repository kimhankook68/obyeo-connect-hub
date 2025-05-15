
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const Surveys = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserAndSurveys = async () => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      
      // Fetch surveys regardless of login status
      fetchSurveys();
    };
    
    fetchUserAndSurveys();
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

  const handleEdit = (e: React.MouseEvent, surveyId: string, ownerId: string | null) => {
    e.stopPropagation();
    
    // Check if the user is the owner of the survey
    if (!user || (ownerId && user.id !== ownerId)) {
      toast({
        title: "권한 없음",
        description: "이 설문을 수정할 권한이 없습니다.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/surveys/edit/${surveyId}`);
  };

  const openDeleteDialog = (e: React.MouseEvent, surveyId: string, ownerId: string | null) => {
    e.stopPropagation();
    
    // Check if the user is the owner of the survey
    if (!user || (ownerId && user.id !== ownerId)) {
      toast({
        title: "권한 없음",
        description: "이 설문을 삭제할 권한이 없습니다.",
        variant: "destructive",
      });
      return;
    }
    
    setSurveyToDelete(surveyId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!surveyToDelete) return;
    
    try {
      // First delete all associated survey questions
      const { error: questionsError } = await supabase
        .from("survey_questions")
        .delete()
        .eq("survey_id", surveyToDelete);
      
      if (questionsError) throw questionsError;
      
      // Then delete all associated responses
      const { error: responsesError } = await supabase
        .from("survey_responses")
        .delete()
        .eq("survey_id", surveyToDelete);
      
      if (responsesError) throw responsesError;
      
      // Finally delete the survey itself
      const { error: surveyError } = await supabase
        .from("surveys")
        .delete()
        .eq("id", surveyToDelete);
      
      if (surveyError) throw surveyError;
      
      // Update the local state
      setSurveys(surveys.filter(survey => survey.id !== surveyToDelete));
      
      toast({
        title: "설문 삭제 완료",
        description: "설문이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      console.error("설문 삭제 실패:", error);
      toast({
        title: "설문 삭제 실패",
        description: "설문을 삭제하는 데 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSurveyToDelete(null);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="설문조사" />
        
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto bg-background">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">설문조사</h1>
            <Button 
              onClick={() => {
                if (!user) {
                  toast({
                    title: "로그인 필요",
                    description: "설문을 생성하려면 로그인이 필요합니다.",
                  });
                  navigate("/auth");
                  return;
                }
                navigate("/surveys/create");
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              새 설문 작성
            </Button>
          </div>
          
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((index) => (
                <Card key={index} className="p-4 border rounded-lg">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : surveys.length === 0 ? (
            <Card className="text-center py-12 bg-muted/30">
              <CardContent>
                <p className="text-muted-foreground mb-4">아직 설문이 없습니다.</p>
                <Button 
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "로그인 필요",
                        description: "설문을 생성하려면 로그인이 필요합니다.",
                      });
                      navigate("/auth");
                      return;
                    }
                    navigate("/surveys/create");
                  }}
                >
                  새 설문 작성하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {surveys.map((survey) => {
                const isOwner = user && user.id === survey.user_id;
                
                return (
                  <Card
                    key={survey.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/surveys/${survey.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h2 className="font-medium text-lg mb-1">{survey.title}</h2>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {survey.description}
                          </p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>생성일: {new Date(survey.created_at).toLocaleDateString()}</span>
                            <span>마감일: {survey.end_date ? new Date(survey.end_date).toLocaleDateString() : '무기한'}</span>
                          </div>
                        </div>
                        {isOwner && (
                          <div className="flex space-x-1 ml-4">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={(e) => handleEdit(e, survey.id, survey.user_id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={(e) => openDeleteDialog(e, survey.id, survey.user_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
        
        <Footer />
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>설문 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 설문을 삭제하시겠습니까? 모든 질문과 응답도 함께 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Surveys;
