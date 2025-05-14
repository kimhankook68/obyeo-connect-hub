
import React from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";

interface DayViewProps {
  date: Date | undefined;
  loading: boolean;
  filteredEvents: CalendarEvent[];
  handleEdit?: (event: CalendarEvent) => void;
  handleDelete?: (event: CalendarEvent) => void;
  isUserLoggedIn: boolean;
}

const DayView: React.FC<DayViewProps> = ({
  date,
  loading,
  filteredEvents,
  handleEdit,
  handleDelete,
  isUserLoggedIn,
}) => {
  // 이벤트 유형별 색상 및 레이블 가져오기
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting": return "border-red-500 bg-red-50";
      case "training": return "border-blue-500 bg-blue-50";
      case "event": return "border-amber-500 bg-amber-50";
      case "volunteer": return "border-green-500 bg-green-50";
      default: return "border-gray-500 bg-gray-50";
    }
  };
  
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "meeting": return "회의";
      case "training": return "교육";
      case "event": return "행사";
      case "volunteer": return "봉사";
      default: return "기타";
    }
  };

  return (
    <div className="border rounded-md w-full h-full flex-1 flex flex-col min-h-[500px]">
      <div className="bg-gray-50 py-2 border-b text-center">
        <div className="font-medium">
          {date ? format(date, "yyyy년 MM월 dd일 EEEE", { locale: ko }) : ""}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredEvents.map((event) => (
              <Card 
                key={event.id}
                className={`overflow-hidden border-l-4 ${getEventTypeColor(event.type)}`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg">{event.title}</h3>
                    <Badge variant="outline">{getEventTypeLabel(event.type)}</Badge>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {format(parseISO(event.start_time), "HH:mm")} - {format(parseISO(event.end_time), "HH:mm")}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                  
                  {isUserLoggedIn && (
                    <div className="flex justify-end gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit && handleEdit(event)}
                      >
                        수정
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete && handleDelete(event)}
                      >
                        삭제
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-lg">해당 날짜에 등록된 일정이 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
