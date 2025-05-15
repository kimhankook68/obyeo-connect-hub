
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SurveyStatistics as SurveyStatsType } from "@/hooks/useSurveyStats";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface SurveyStatisticsProps {
  stats: SurveyStatsType;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export const SurveyStatistics = ({ stats }: SurveyStatisticsProps) => {
  const { loading, error, totalResponses, questionStats } = stats;

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>오류</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (totalResponses === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>응답 없음</AlertTitle>
        <AlertDescription>아직 제출된 설문 응답이 없습니다.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>설문 통계</CardTitle>
        <CardDescription>총 응답자 수: {totalResponses}명</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {questionStats.map((questionStat) => (
          <div key={questionStat.questionId} className="space-y-2">
            <h3 className="text-lg font-medium">{questionStat.question}</h3>
            
            {questionStat.questionType === 'text' ? (
              <div className="text-sm text-muted-foreground">
                텍스트 응답 수: {questionStat.stats[0]?.count || 0}개 (응답률: {questionStat.stats[0]?.percentage.toFixed(1) || 0}%)
              </div>
            ) : questionStat.questionType === 'single_choice' ? (
              <div className="h-[300px] w-full">
                <ChartContainer config={{
                  option: { theme: { light: "#10b981", dark: "#10b981" } },
                }}>
                  <PieChart>
                    <Pie
                      data={questionStat.stats}
                      dataKey="count"
                      nameKey="option"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={(entry) => `${entry.option}: ${entry.count}명 (${entry.percentage.toFixed(1)}%)`}
                    >
                      {questionStat.stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ChartContainer config={{
                  option: { theme: { light: "#10b981", dark: "#10b981" } },
                }}>
                  <BarChart data={questionStat.stats}>
                    <XAxis 
                      dataKey="option"
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#10b981">
                      {questionStat.stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            )}
            
            <div className="mt-2 space-y-1">
              {questionStat.questionType !== 'text' && questionStat.stats.map((stat, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="truncate max-w-[70%]">{stat.option}</span>
                  <span className="text-muted-foreground">{stat.count}명 ({stat.percentage.toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
