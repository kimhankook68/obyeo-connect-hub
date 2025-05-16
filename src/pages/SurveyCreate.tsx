
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { format, parse, isValid } from "date-fns";
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
  question: string;
  question_type: 'text' | 'textarea' | 'single_choice' | 'multiple_choice';
  options: QuestionOption[];
  required: boolean;
  order_num: number;
}

const SurveyCreate = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endDateInput, setEndDateInput] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        toast.error("로그인 필요", {
          description: "설문을 생성하려면 로그인이 필요합니다.",
        });
        navigate("/auth");
      }
    };

    fetchUser();
  }, [navigate]);

  // Update input field when date is selected from calendar
  useEffect(() => {
    if (endDate) {
      setEndDateInput(format(endDate, "yyyy-MM-dd"));
    }
  }, [endDate]);

  // Parse manual date input
  const handleEndDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setEndDateInput(inputValue);
    
    // Try to parse the date if format is correct
    if (inputValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parsedDate = parse(inputValue, "yyyy-MM-dd", new Date());
      if (isValid(parsedDate)) {
        setEndDate(parsedDate);
      } else {
        setEndDate(undefined);
      }
    } else {
      setEndDate(undefined);
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

    if (!user) {
      toast.error("로그인 필요", {
        description: "설문을 생성하려면 로그인이 필요합니다.",
      });
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      
      // Manual parsing for endDate if text input is provided but date object is not set
      let finalEndDate = null;
      if (endDateInput && !endDate) {
        const parsedDate = parse(endDateInput, "yyyy-MM-dd", new Date());
        if (isValid(parsedDate)) {
          finalEndDate = parsedDate.toISOString();
        }
      } else if (endDate) {
        finalEndDate = endDate.toISOString();
      }
      
      // Create survey with user_id
      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .insert([
          {
            title,
            description: description.trim() || null,
            end_date: finalEndDate,
            user_id: user.id
          }
        ])
        .select();

      if (surveyError) throw surveyError;
      
      const surveyId = surveyData[0].id;
      
      // Create questions
      for (const question of questions) {
        const { error: questionError } = await supabase
          .from("survey_questions")
          .insert({
            survey_id: surveyId,
            question: question.question,
            question_type: question.question_type,
            options: question.options.length > 0 ? question.options as unknown as Json : null,
            required: question.required,
            order_num: question.order_num
          });
          
        if (questionError) {
          console.error("Question insertion error:", questionError);
          throw questionError;
        }
      }
      
      toast.success("설문이 성공적으로 생성되었습니다.");
      navigate(`/surveys/${surveyId}`);
    } catch (error: any) {
      console.error("설문 생성 실패:", error);
      toast.error("설문 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="새 설문 작성" />
        
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
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <Input
                    id="endDateInput"
                    placeholder="YYYY-MM-DD"
                    value={endDateInput}
                    onChange={handleEndDateInputChange}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">예) 2025-12-31 형식으로 입력하세요</p>
                </div>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="px-3"
                      type="button"
                      aria-label="달력에서 날짜 선택"
                    >
                      <CalendarIcon className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <div className="bg-background rounded-md shadow-md border">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date);
                          setIsCalendarOpen(false);
                        }}
                        initialFocus
                        disabled={(date) => date < new Date()}
                        className="border-0 pointer-events-auto"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
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
                              <SelectContent className="pointer-events-auto">
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
                            
                            {question.options.length === 0 ? (
                              <div className="text-center py-2 border rounded bg-muted/20">
                                <p className="text-sm text-muted-foreground">
                                  최소 2개 이상의 선택지를 추가해주세요.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
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
                onClick={() => navigate("/surveys")}
                disabled={loading}
              >
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
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

export default SurveyCreate;
