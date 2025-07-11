
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, PlusIcon, Trash2Icon, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Json } from "@/integrations/supabase/types";

interface QuestionOption {
  label: string;
  value: string;
}

interface SurveyQuestion {
  id?: string;
  question: string;
  question_type: 'text' | 'textarea' | 'single_choice' | 'multiple_choice';
  options: QuestionOption[];
  required: boolean;
  order_num: number;
  survey_id?: string;
}

const SurveyEdit = () => {
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [user, setUser] = useState<any>(null);
  const [originalQuestions, setOriginalQuestions] = useState<SurveyQuestion[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [surveyOwnerId, setSurveyOwnerId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchSurvey();
      } else {
        toast.error("로그인 필요", {
          description: "설문을 수정하려면 로그인이 필요합니다.",
        });
        navigate("/auth");
      }
    };

    fetchUser();
  }, [navigate]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      
      // Fetch survey details
      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", id)
        .single();
      
      if (surveyError) throw surveyError;
      
      // Store the survey owner ID
      setSurveyOwnerId(surveyData.user_id);
      
      // Check if the current user is the owner of the survey
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && surveyData.user_id && session.user.id !== surveyData.user_id) {
        toast.error("권한 없음", {
          description: "이 설문을 수정할 권한이 없습니다.",
        });
        navigate(`/surveys/${id}`);
        return;
      }
      
      setTitle(surveyData.title);
      setDescription(surveyData.description || "");
      if (surveyData.end_date) {
        setEndDate(new Date(surveyData.end_date));
      }
      
      // Fetch survey questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("survey_questions")
        .select("*")
        .eq("survey_id", id)
        .order("order_num", { ascending: true });
      
      if (questionsError) throw questionsError;
      
      const formattedQuestions = questionsData.map(q => ({
        id: q.id,
        survey_id: q.survey_id,
        question: q.question,
        question_type: q.question_type as 'text' | 'textarea' | 'single_choice' | 'multiple_choice',
        options: q.options as unknown as QuestionOption[] || [],
        required: q.required || false,
        order_num: q.order_num
      }));
      
      setQuestions(formattedQuestions);
      setOriginalQuestions([...formattedQuestions]);
      
    } catch (error) {
      console.error("설문 로드 실패:", error);
      toast.error("설문 로드 실패", {
        description: "설문을 불러오는 데 실패했습니다.",
      });
      navigate("/surveys");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        question_type: "text",
        options: [],
        required: false,
        order_num: questions.length
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    const question = questions[index];
    if (question.id) {
      // Store the ID of questions to delete from DB
      setDeletedQuestionIds([...deletedQuestionIds, question.id]);
    }
    
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Update order_num for remaining questions
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      order_num: i
    }));
    setQuestions(reorderedQuestions);
  };

  const updateQuestion = (index: number, field: keyof SurveyQuestion, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const newOption = { label: "", value: "" };
    
    updatedQuestions[questionIndex].options = [
      ...updatedQuestions[questionIndex].options,
      newOption
    ];
    
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: keyof QuestionOption, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex][field] = value;
    
    // Auto-fill value if empty when label is typed
    if (field === 'label' && !updatedQuestions[questionIndex].options[optionIndex].value) {
      updatedQuestions[questionIndex].options[optionIndex].value = value;
    }
    
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = 
      updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast("설문 제목을 입력해주세요.");
      return;
    }

    if (questions.length === 0) {
      toast("최소 한 개 이상의 질문을 추가해주세요.");
      return;
    }

    // Validate questions
    const invalidQuestions = questions.filter(q => !q.question.trim());
    if (invalidQuestions.length > 0) {
      toast("모든 질문 내용을 입력해주세요.");
      return;
    }

    // Validate options for choice questions
    const invalidOptions = questions.filter(q => 
      (q.question_type === 'single_choice' || q.question_type === 'multiple_choice') && 
      (q.options.length < 2 || q.options.some(opt => !opt.label.trim()))
    );
    
    if (invalidOptions.length > 0) {
      toast("선택형 질문에는 최소 2개 이상의 유효한 선택지가 필요합니다.");
      return;
    }

    // Check if current user is the survey owner
    if (!user || (surveyOwnerId && user.id !== surveyOwnerId)) {
      toast.error("권한 없음", {
        description: "이 설문을 수정할 권한이 없습니다.",
      });
      return;
    }

    try {
      setSaving(true);
      
      // Update survey
      const { error: surveyError } = await supabase
        .from("surveys")
        .update({
          title,
          description: description.trim() || null,
          end_date: endDate ? endDate.toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (surveyError) throw surveyError;
      
      // Delete removed questions
      if (deletedQuestionIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("survey_questions")
          .delete()
          .in("id", deletedQuestionIds);
          
        if (deleteError) throw deleteError;
      }
      
      // Update or insert questions
      for (const question of questions) {
        if (question.id) {
          // Update existing question
          const { error: updateError } = await supabase
            .from("survey_questions")
            .update({
              question: question.question,
              question_type: question.question_type,
              options: question.options.length > 0 ? question.options as unknown as Json : null,
              required: question.required,
              order_num: question.order_num
            })
            .eq("id", question.id);
            
          if (updateError) throw updateError;
        } else {
          // Insert new question
          const { error: insertError } = await supabase
            .from("survey_questions")
            .insert({
              survey_id: id,
              question: question.question,
              question_type: question.question_type,
              options: question.options.length > 0 ? question.options as unknown as Json : null,
              required: question.required,
              order_num: question.order_num
            });
            
          if (insertError) throw insertError;
        }
      }
      
      toast.success("설문이 성공적으로 업데이트되었습니다.");
      navigate(`/surveys/${id}`);
    } catch (error: any) {
      console.error("설문 수정 실패:", error);
      toast.error("설문 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="설문 수정" />
          <main className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="설문 수정" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-1">
              <label htmlFor="title" className="text-sm font-medium">
                설문 제목
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="설문 제목을 입력하세요"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="description" className="text-sm font-medium">
                설문 설명 (선택사항)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설문에 대한 설명을 입력하세요"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="endDate" className="text-sm font-medium">
                마감일 (선택사항)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "yyyy-MM-dd") : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <div className="bg-background rounded-md shadow-md border">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className="border-0"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">설문 질문</h2>
                <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                  <PlusIcon className="h-4 w-4 mr-1" /> 질문 추가
                </Button>
              </div>
              
              {questions.length === 0 ? (
                <div className="text-center py-6 border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground mb-4">질문을 추가해 주세요.</p>
                  <Button type="button" onClick={addQuestion}>
                    질문 추가하기
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                          <span className="font-medium">질문 {index + 1}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeQuestion(index)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">질문 내용</label>
                          <Input
                            value={question.question}
                            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                            placeholder="질문을 입력하세요"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1 flex-1">
                            <label className="text-sm font-medium">질문 유형</label>
                            <Select
                              value={question.question_type}
                              onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">짧은 답변</SelectItem>
                                <SelectItem value="textarea">긴 답변</SelectItem>
                                <SelectItem value="single_choice">단일 선택</SelectItem>
                                <SelectItem value="multiple_choice">복수 선택</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-6 ml-4">
                            <Switch
                              id={`required-${index}`}
                              checked={question.required}
                              onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
                            />
                            <Label htmlFor={`required-${index}`}>필수 질문</Label>
                          </div>
                        </div>
                        
                        {(question.question_type === 'single_choice' || question.question_type === 'multiple_choice') && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium">선택지</label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(index)}
                              >
                                <PlusIcon className="h-3 w-3 mr-1" /> 선택지 추가
                              </Button>
                            </div>
                            
                            {question.options?.length === 0 ? (
                              <div className="text-center py-2 border rounded bg-muted/20">
                                <p className="text-sm text-muted-foreground">
                                  최소 2개 이상의 선택지를 추가해주세요.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {question.options?.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <Input
                                      value={option.label}
                                      onChange={(e) => updateOption(index, optionIndex, 'label', e.target.value)}
                                      placeholder={`선택지 ${optionIndex + 1}`}
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => removeOption(index, optionIndex)}
                                    >
                                      <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/surveys/${id}`)}
                disabled={saving}
              >
                취소
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    저장 중...
                  </>
                ) : (
                  "저장"
                )}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default SurveyEdit;
