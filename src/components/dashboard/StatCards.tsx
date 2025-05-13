
import React from "react";

const StatCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="p-6 rounded-lg border border-border bg-card shadow-sm flex flex-col items-center justify-center">
        <div className="text-4xl mb-4">📬</div>
        <div className="text-2xl font-medium">12</div>
        <div className="text-sm text-muted-foreground">새 메시지</div>
      </div>
      
      <div className="p-6 rounded-lg border border-border bg-card shadow-sm flex flex-col items-center justify-center">
        <div className="text-4xl mb-4">✅</div>
        <div className="text-2xl font-medium">5</div>
        <div className="text-sm text-muted-foreground">진행중인 업무</div>
      </div>
      
      <div className="p-6 rounded-lg border border-border bg-card shadow-sm flex flex-col items-center justify-center">
        <div className="text-4xl mb-4">📅</div>
        <div className="text-2xl font-medium">3</div>
        <div className="text-sm text-muted-foreground">오늘의 일정</div>
      </div>
    </div>
  );
};

export default StatCards;
