
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // Sonner로 변경
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SurveyStatistics } from '@/components/survey/SurveyStatistics';
import { useSurveyStats } from '@/hooks/useSurveyStats';
import { Loader2, BarChart3 } from 'lucide-react';
import { Json } from "@/integrations/supabase/types";

interface Question {
  id: string;
  survey_id: string;
  question: string;
  question_type: 'text' | 'single_choice' | 'multiple_choice' | 'textarea';
  options: any[]; // Changed from string[] to any[] to handle JSON data
  required: boolean;
  order_num: number;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  end_date: string | null;
  created_at: string;
}

const SurveyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});
  const [hasResponded, setHasResponded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("survey");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 설문 통계 데이터 가져오기
  const surveyStats = useSurveyStats(id || '');

  useEffect(() => {
    if (id) {
      fetchSurvey();
      fetchQuestions();
      checkUserResponses();
    }
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSurvey(data);
    } catch (error) {
      console.error('Error fetching survey:', error);
      toast.error('설문조사를 불러오는데 실패했습니다.');
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', id)
        .order('order_num');

      if (error) throw error;
      
      // Updated type casting to ensure compatibility with Question interface
      // Converting the data to match our Question interface
      if (data) {
        const formattedQuestions: Question[] = data.map(q => ({
          ...q,
          question_type: q.question_type as 'text' | 'single_choice' | 'multiple_choice' | 'textarea',
          // Handle options correctly, ensuring it's always an array
          options: Array.isArray(q.options) ? q.options : []
        }));
        
        setQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserResponses = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user?.id) {
        return;
      }

      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', id)
        .eq('user_id', session.session.user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Safely handle responses data
        const responseData = typeof data.responses === 'object' ? data.responses : {};
        setUserResponses(responseData || {});
        setHasResponded(true);
      }
    } catch (error) {
      console.error('Error checking user responses:', error);
    }
  };

  const handleInputChange = (questionId: string, value: any) => {
    setUserResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Special handler for multiple choice questions
  const handleMultipleChoiceChange = (questionId: string, optionValue: string, checked: boolean) => {
    setUserResponses(prev => {
      const currentValues = Array.isArray(prev[questionId]) ? [...prev[questionId]] : [];
      
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, optionValue]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter(v => v !== optionValue)
        };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // 로그인 체크
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast.error('로그인이 필요합니다.', {
          description: '설문에 응답하려면 로그인해주세요.'
        });
        return;
      }

      // 필수 질문 검증
      const requiredQuestions = questions.filter(q => q.required);
      const unansweredRequired = requiredQuestions.filter(q => {
        const response = userResponses[q.id];
        if (response === undefined || response === null) return true;
        if (typeof response === 'string' && response.trim() === '') return true;
        if (Array.isArray(response) && response.length === 0) return true;
        return false;
      });

      if (unansweredRequired.length > 0) {
        toast.error('필수 항목을 모두 작성해주세요.', {
          description: `${unansweredRequired.length}개의 필수 질문에 대한 응답이 필요합니다.`
        });
        return;
      }

      // 응답 제출
      const { error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: id,
          user_id: session.session.user.id,
          responses: userResponses
        });

      if (error) throw error;

      toast.success('설문 응답이 성공적으로 제출되었습니다.');
      
      setHasResponded(true);
    } catch (error) {
      console.error('Error submitting survey responses:', error);
      toast.error('응답 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const questionType = question.question_type;
    const options = question.options || [];
    const value = userResponses[question.id] || (questionType === 'multiple_choice' ? [] : '');
    
    switch (questionType) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="응답을 입력하세요"
            disabled={hasResponded}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="응답을 입력하세요"
            className="min-h-[100px]"
            disabled={hasResponded}
          />
        );
      case 'single_choice':
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleInputChange(question.id, val)}
            disabled={hasResponded}
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
                    disabled={hasResponded}
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
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="응답을 입력하세요"
            disabled={hasResponded}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="설문조사" />
          <main className="flex-1 p-6 overflow-y-auto bg-background">
            <div className="container mx-auto max-w-5xl">
              <div className="flex justify-center items-center h-[70vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="설문조사 상세" />
        <main className="flex-1 p-6 overflow-y-auto bg-background">
          <div className="container mx-auto max-w-5xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{survey?.title || '설문조사'}</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/surveys')}
                >
                  목록으로
                </Button>
              </div>
            </div>

            <Tabs defaultValue="survey" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="survey">설문지</TabsTrigger>
                <TabsTrigger value="statistics" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>통계</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="survey">
                {hasResponded && (
                  <Card className="mb-4">
                    <CardContent className="pt-6 pb-4">
                      <p className="text-amber-700 bg-amber-50 px-4 py-2 rounded-md border border-amber-200">
                        이미 이 설문에 응답하셨습니다.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>{survey?.title}</CardTitle>
                    {survey?.description && <CardDescription>{survey.description}</CardDescription>}
                    {survey?.end_date && new Date(survey.end_date) < new Date() && (
                      <div className="text-sm text-red-500 mt-2">
                        이 설문조사는 마감되었습니다. (마감일: {new Date(survey.end_date).toLocaleDateString()})
                      </div>
                    )}
                  </CardHeader>
                </Card>

                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="pt-6">
                        <div className="mb-2">
                          <span className="font-medium">
                            {index + 1}. {question.question}
                          </span>
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        {renderQuestionInput(question)}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {!hasResponded && !(survey?.end_date && new Date(survey.end_date) < new Date()) && (
                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      응답 제출
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="statistics">
                <SurveyStatistics stats={surveyStats} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SurveyDetail;
