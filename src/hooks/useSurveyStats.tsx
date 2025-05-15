
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SurveyStatistics = {
  totalResponses: number;
  questionStats: {
    questionId: string;
    question: string;
    questionType: string;
    stats: {
      option?: string;
      count: number;
      percentage: number;
    }[];
  }[];
  loading: boolean;
  error: string | null;
};

export const useSurveyStats = (surveyId: string) => {
  const [stats, setStats] = useState<SurveyStatistics>({
    totalResponses: 0,
    questionStats: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchSurveyStats = async () => {
      try {
        // 1. 설문 질문 가져오기
        const { data: questions, error: questionsError } = await supabase
          .from('survey_questions')
          .select('*')
          .eq('survey_id', surveyId)
          .order('order_num');

        if (questionsError) throw new Error(questionsError.message);
        
        // 2. 설문 응답 가져오기
        const { data: responses, error: responsesError } = await supabase
          .from('survey_responses')
          .select('*')
          .eq('survey_id', surveyId);
          
        if (responsesError) throw new Error(responsesError.message);
        
        // 3. 통계 계산하기
        const totalResponses = responses.length;
        
        const questionStats = questions.map(question => {
          let stats: { option?: string; count: number; percentage: number }[] = [];
          
          // 질문 유형에 따라 통계 계산 방식 다르게 적용
          if (question.question_type === 'multiple_choice' || question.question_type === 'single_choice') {
            // 선택형 질문의 경우 각 옵션별 통계
            const options = question.options || [];
            
            // 각 옵션별로 카운트 초기화
            const optionCounts: Record<string, number> = {};
            options.forEach((option: string) => {
              optionCounts[option] = 0;
            });
            
            // 응답 카운트
            responses.forEach(response => {
              const answer = response.responses[question.id];
              if (Array.isArray(answer)) {
                answer.forEach(selected => {
                  if (optionCounts[selected] !== undefined) {
                    optionCounts[selected]++;
                  }
                });
              } else if (typeof answer === 'string' && optionCounts[answer] !== undefined) {
                optionCounts[answer]++;
              }
            });
            
            // 통계 계산
            stats = options.map(option => ({
              option,
              count: optionCounts[option] || 0,
              percentage: totalResponses > 0 ? (optionCounts[option] || 0) / totalResponses * 100 : 0
            }));
          } else {
            // 텍스트형 질문의 경우 응답 수만 집계
            const answeredCount = responses.filter(response => {
              const answer = response.responses[question.id];
              return answer && answer.trim && answer.trim() !== '';
            }).length;
            
            stats = [{
              count: answeredCount,
              percentage: totalResponses > 0 ? answeredCount / totalResponses * 100 : 0
            }];
          }
          
          return {
            questionId: question.id,
            question: question.question,
            questionType: question.question_type,
            stats
          };
        });
        
        setStats({
          totalResponses,
          questionStats,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching survey statistics:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : '통계를 불러오는 중 오류가 발생했습니다.'
        }));
      }
    };

    if (surveyId) {
      fetchSurveyStats();
    }
  }, [surveyId]);

  return stats;
};
