
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const SurveyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [survey, setSurvey] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [isSurveyExpired, setIsSurveyExpired] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        // Fetch survey
        const { data: surveyData, error: surveyError } = await supabase
          .from("surveys")
          .select("*")
          .eq("id", id)
          .single();

        if (surveyError) throw surveyError;
        setSurvey(surveyData);

        // Check if survey is expired
        if (surveyData.end_date && new Date(surveyData.end_date) < new Date()) {
          setIsSurveyExpired(true);
        }

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("survey_questions")
          .select("*")
          .eq("survey_id", id)
          .order("order_num", { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);

        // Check if user has already responded
        if (user) {
          const { data: responseData, error: responseError } = await supabase
            .from("survey_responses")
            .select("*")
            .eq("survey_id", id)
            .eq("user_id", user.id)
            .single();

          if (responseData) {
            setHasResponded(true);
            // Pre-fill responses if they exist
            if (responseData.responses) {
              setResponses(responseData.responses as { [key: string]: any });
            }
          }
        }
      } catch (error) {
        if ((error as any).code !== "PGRST116") { // Not Found error code
          console.error("설문 가져오기 실패:", error);
          toast.error("설문 로드 실패", {
            description: "설문 정보를 불러오는 데 실패했습니다."
          });
          navigate("/surveys");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchSurvey();
    } else if (id) {
      // If not logged in, just fetch survey and questions without checking responses
      fetchSurvey();
    }
  }, [id, navigate, user]);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultipleChoiceChange = (questionId: string, optionValue: string, checked: boolean) => {
    setResponses((prev) => {
      const currentValues = prev[questionId] || [];
      
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, optionValue]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter((val: string) => val !== optionValue)
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("로그인 필요", {
        description: "설문에 응답하려면 로그인이 필요합니다."
      });
      return;
    }

    // Validate required questions
    const unansweredRequiredQuestions = questions
      .filter(q => q.required)
      .filter(q => {
        const response = responses[q.id];
        return !response || 
          (Array.isArray(response) && response.length === 0) || 
          (typeof response === 'string' && response.trim() === '');
      });

    if (unansweredRequiredQuestions.length > 0) {
      toast.error("필수 항목 입력 필요", {
        description: "모든 필수 항목을 입력해주세요."
      });
      return;
    }

    try {
      setSubmitLoading(true);
      
      const { error } = await supabase
        .from("survey_responses")
        .insert([
          {
            survey_id: id,
            user_id: user.id,
            responses
          }
        ]);

      if (error) throw error;
      
      toast.success("설문 응답이 성공적으로 제출되었습니다.");
      setHasResponded(true);
    } catch (error) {
      console.error("설문 응답 제출 실패:", error);
      toast.error("설문 응답 제출에 실패했습니다.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderQuestionInput = (question: any) => {
    const questionType = question.question_type;
    const options = question.options || [];
    const value = responses[question.id] || (questionType === 'multiple_choice' ? [] : '');
    
    switch (questionType) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="응답을 입력하세요"
            disabled={hasResponded || !user || isSurveyExpired}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="응답을 입력하세요"
            className="min-h-[100px]"
            disabled={hasResponded || !user || isSurveyExpired}
          />
        );
      case 'single_choice':
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleResponseChange(question.id, val)}
            disabled={hasResponded || !user || isSurveyExpired}
            className="space-y-1"
          >
            {options.map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value || option} id={`${question.id}-option-${index}`} />
                <Label htmlFor={`${question.id}-option-${index}`}>{option.label || option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'multiple_choice':
        return (
          <div className="space-y-1">
            {options.map((option: any, index: number) => {
              const optionValue = option.value || option;
              const isChecked = Array.isArray(value) && value.includes(optionValue);
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-option-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => 
                      handleMultipleChoiceChange(question.id, optionValue, checked === true)
                    }
                    disabled={hasResponded || !user || isSurveyExpired}
                  />
                  <Label htmlFor={`${question.id}-option-${index}`}>{option.label || option}</Label>
                </div>
              );
            })}
          </div>
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="응답을 입력하세요"
            disabled={hasResponded || !user || isSurveyExpired}
          />
        );
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={loading ? "설문조사" : survey?.title} />
        
        <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full bg-background">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <Card key={index}>
                    <CardHeader>
                      <Skeleton className="h-6 w-2/3" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">{survey.title}</CardTitle>
                  {survey.description && (
                    <CardDescription className="mt-2">{survey.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {isSurveyExpired && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>설문 마감</AlertTitle>
                  <AlertDescription>
                    이 설문은 마감되었습니다.
                  </AlertDescription>
                </Alert>
              )}

              {hasResponded && (
                <Alert>
                  <AlertTitle>설문 응답 완료</AlertTitle>
                  <AlertDescription>
                    이미 이 설문에 응답하셨습니다. 응답을 수정할 수 없습니다.
                  </AlertDescription>
                </Alert>
              )}

              {!user && (
                <Alert>
                  <AlertTitle>로그인 필요</AlertTitle>
                  <AlertDescription>
                    설문에 응답하려면 로그인이 필요합니다.
                  </AlertDescription>
                </Alert>
              )}

              {questions.length > 0 ? (
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="border shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-2 mb-4">
                          <span className="font-medium">{index + 1}.</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{question.question}</span>
                              {question.required && (
                                <span className="text-red-500">*</span>
                              )}
                            </div>
                            <div className="mt-3">
                              {renderQuestionInput(question)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!hasResponded && !isSurveyExpired && user && (
                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={handleSubmit}
                        disabled={submitLoading}
                        className="px-6"
                      >
                        {submitLoading ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                            제출 중...
                          </>
                        ) : (
                          "응답 제출"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="border text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">이 설문에는 아직 질문이 없습니다.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default SurveyDetail;
