
import React from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Clock, MapPin, Tag } from "lucide-react";

interface EventItemProps {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  formatEventDate: (dateString: string) => string;
  isUserLoggedIn: boolean;
}

const getEventTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    meeting: "회의",
    training: "교육",
    event: "행사",
    volunteer: "봉사",
    other: "기타",
  };
  return types[type] || type;
};

const getEventTypeColor = (type: string): string => {
  switch (type) {
    case "meeting":
      return "bg-red-100 text-red-800 border-red-200";
    case "training":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "event":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "volunteer":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const EventItem: React.FC<EventItemProps> = ({
  event,
  onEdit,
  onDelete,
  formatEventDate,
  isUserLoggedIn,
}) => {
  // 현재 사용자가 이벤트 작성자인지 확인 (user_id가 있는 경우만)
  const canManageEvent = isUserLoggedIn && event.user_id;
  
  return (
    <Card className="overflow-hidden border-l-4" style={{
      borderLeftColor: event.type === 'meeting' ? '#dc3545' : 
                       event.type === 'training' ? '#0dcaf0' : 
                       event.type === 'event' ? '#ffc107' : 
                       event.type === 'volunteer' ? '#198754' : '#6c757d'
    }}>
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium">{event.title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
            {getEventTypeLabel(event.type)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-2 px-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <div>
              {format(parseISO(event.start_time), "yyyy-MM-dd HH:mm")} ~ {format(parseISO(event.end_time), "HH:mm")}
            </div>
          </div>
          {event.location && (
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <div>{event.location}</div>
            </div>
          )}
          {event.description && (
            <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
          )}
        </div>
      </CardContent>
      {isUserLoggedIn && (
        <CardFooter className="pt-2 px-4 pb-3 bg-gray-50">
          <div className="flex justify-end space-x-2 w-full">
            <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
              수정
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(event)}>
              삭제
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default EventItem;
