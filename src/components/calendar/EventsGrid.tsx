
import React from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "date-fns";
import { ko } from "date-fns/locale";
import { parseISO } from "date-fns";
import { Clock, MapPin, User, Calendar as CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EventsGridProps {
  events: CalendarEvent[];
  handleEdit: (event: CalendarEvent) => void;
  handleDelete: (event: CalendarEvent) => void;
  formatEventDate: (dateString: string) => string;
  isUserLoggedIn: boolean;
  selectedDate: Date | undefined;
}

const EventsGrid: React.FC<EventsGridProps> = ({
  events,
  handleEdit,
  handleDelete,
  formatEventDate,
  isUserLoggedIn,
  selectedDate,
}) => {
  if (!events.length) {
    return (
      <div className="text-center p-4 text-gray-500">
        {selectedDate ? (
          <p>선택한 날짜에 등록된 일정이 없습니다.</p>
        ) : (
          <p>날짜를 선택하여 일정을 확인하세요.</p>
        )}
      </div>
    );
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-red-100 text-red-800";
      case "training":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-amber-100 text-amber-800";
      case "volunteer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "meeting":
        return "회의";
      case "training":
        return "교육";
      case "event":
        return "행사";
      case "volunteer":
        return "봉사";
      default:
        return "기타";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <Badge className={`${getEventTypeColor(event.type)}`}>
                {getEventTypeLabel(event.type)}
              </Badge>
              {event.user_id && (
                <div className="text-xs text-gray-500 flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {event.user_name || "사용자"}
                </div>
              )}
            </div>
            <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
            <CardDescription className="flex items-center text-xs">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {formatEventDate(event.start_time)}
              {event.end_time && ` - ${formatEventDate(event.end_time)}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {event.location && (
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <MapPin className="h-3 w-3 mr-1" />
                {event.location}
              </div>
            )}
            <p className="text-sm mt-2">{event.description || "상세 설명이 없습니다."}</p>
          </CardContent>
          <CardFooter className="flex justify-end p-3 pt-0 gap-2">
            {isUserLoggedIn && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(event)}
                >
                  수정
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(event)}
                >
                  삭제
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default EventsGrid;
