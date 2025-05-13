
import React from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

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

const EventItem: React.FC<EventItemProps> = ({
  event,
  onEdit,
  onDelete,
  formatEventDate,
  isUserLoggedIn,
}) => {
  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800";
      case "training":
        return "bg-green-100 text-green-800";
      case "event":
        return "bg-purple-100 text-purple-800";
      case "volunteer":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{event.title}</CardTitle>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(event.type)}`}>
            {getEventTypeLabel(event.type)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="mr-2">🕒</span>
            <div>
              {formatEventDate(event.start_time)} ~ {formatEventDate(event.end_time)}
            </div>
          </div>
          {event.location && (
            <div className="flex items-center text-sm">
              <span className="mr-2">📍</span>
              <div>{event.location}</div>
            </div>
          )}
          {event.description && (
            <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
          )}
        </div>
      </CardContent>
      {isUserLoggedIn && (
        <CardFooter className="pt-2">
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
