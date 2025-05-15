
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Define types for statistics
export interface QuestionStats {
  id: string;
  question: string;
  question_type: string;
  responseCount: number;
  options?: any[];
  responses?: any[];
  distribution?: {
    label: string;
    value: number;
    percentage: number;
  }[];
}

export interface SurveyStatsData {
  totalResponses: number;
  questions: QuestionStats[];
  loading: boolean;
  error: string | null;
}

export const useSurveyStats = (surveyId: string): SurveyStatsData => {
  const [stats, setStats] = useState<SurveyStatsData>({
    totalResponses: 0,
    questions: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!surveyId) return;
    
    const fetchStats = async () => {
      try {
        // 설문 질문 가져오기
        const { data: questions, error: questionsError } = await supabase
          .from('survey_questions')
          .select('*')
          .eq('survey_id', surveyId)
          .order('order_num');
          
        if (questionsError) throw questionsError;
        
        // 설문 응답 가져오기
        const { data: responses, error: responsesError } = await supabase
          .from('survey_responses')
          .select('*')
          .eq('survey_id', surveyId);
          
        if (responsesError) throw responsesError;
        
        // 질문별 통계 계산
        const questionStats: QuestionStats[] = (questions || []).map(q => {
          const questionResponses: any[] = [];
          
          // 각 응답에서 현재 질문에 대한 답변 추출
          responses?.forEach(response => {
            const responseData = response.responses;
            if (responseData && typeof responseData === 'object' && responseData[q.id] !== undefined) {
              questionResponses.push(responseData[q.id]);
            }
          });
          
          let distribution;
          
          // 질문 유형에 따라 응답 분포 계산
          if (q.question_type === 'single_choice' || q.question_type === 'multiple_choice') {
            const optionsArray = Array.isArray(q.options) ? q.options : [];
            const counts: Record<string, number> = {};
            
            // 초기 카운트 0으로 설정
            optionsArray.forEach((option: any) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              counts[optionValue] = 0;
            });
            
            // 응답 카운트
            questionResponses.forEach(response => {
              if (Array.isArray(response)) {
                // 다중 선택의 경우
                response.forEach(value => {
                  counts[value] = (counts[value] || 0) + 1;
                });
              } else {
                // 단일 선택의 경우
                counts[response] = (counts[response] || 0) + 1;
              }
            });
            
            // 분포 계산
            distribution = optionsArray.map((option: any) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const count = counts[optionValue] || 0;
              return {
                label: optionLabel,
                value: count,
                percentage: questionResponses.length ? Math.round((count / questionResponses.length) * 100) : 0
              };
            });
          }
          
          return {
            id: q.id,
            question: q.question,
            question_type: q.question_type,
            responseCount: questionResponses.length,
            options: Array.isArray(q.options) ? q.options : [],
            responses: questionResponses,
            distribution
          };
        });
        
        setStats({
          totalResponses: responses?.length || 0,
          questions: questionStats,
          loading: false,
          error: null
        });
        
      } catch (error) {
        console.error('Error fetching survey stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: '통계 데이터를 불러오는데 실패했습니다.'
        }));
        
        toast({
          title: '통계 데이터 로드 실패',
          description: '설문 통계를 불러오는데 오류가 발생했습니다.',
          variant: 'destructive',
        });
      }
    };

    fetchStats();
  }, [surveyId]);

  return stats;
};
