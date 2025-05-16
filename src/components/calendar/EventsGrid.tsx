
import React from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Badge } from "@/components/ui/badge";
import { parseISO, format } from "date-fns";
import { ko } from "date-fns/locale";
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
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col items-center justify-center h-60 bg-muted/10 rounded-lg border border-dashed">
        <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
        <p className="text-muted-foreground">
          {selectedDate ? (
            <span>선택한 날짜에 등록된 일정이 없습니다.</span>
          ) : (
            <span>날짜를 선택하여 일정을 확인하세요.</span>
          )}
        </p>
      </div>
    );
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "border-red-500 bg-red-50";
      case "training":
        return "border-blue-500 bg-blue-50";
      case "event":
        return "border-amber-500 bg-amber-50";
      case "volunteer":
        return "border-green-500 bg-green-50";
      default:
        return "border-gray-500 bg-gray-50";
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {events.map((event) => (
        <Card 
          key={event.id}
          className={`overflow-hidden border-l-4 hover:shadow-md transition-shadow ${getEventTypeColor(event.type)}`}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle 
                className="text-lg cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleEdit(event)}
              >
                {event.title}
              </CardTitle>
              <Badge variant="outline">{getEventTypeLabel(event.type)}</Badge>
            </div>
            <CardDescription className="flex items-center mt-2 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {format(parseISO(event.start_time), "HH:mm")} - {format(parseISO(event.end_time), "HH:mm")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {event.location && (
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {event.location}
              </div>
            )}
            {event.description && (
              <p className="text-sm mt-2 line-clamp-2">
                {event.description}
              </p>
            )}
          </CardContent>
          {isUserLoggedIn && (
            <CardFooter className="flex justify-end p-3 border-t bg-muted/5">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(event)}
                >
                  보기
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(event)}
                >
                  삭제
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default EventsGrid;
