
import React from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar, Tag } from "lucide-react";

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  onEdit: () => void;
  onDelete: () => void;
  isUserLoggedIn: boolean;
  canEditEvent: boolean;
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

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  open,
  onOpenChange,
  event,
  onEdit,
  onDelete,
  isUserLoggedIn,
  canEditEvent
}) => {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{event.title}</DialogTitle>
          <div className="mt-1">
            <Badge className={getEventTypeColor(event.type)}>
              {getEventTypeLabel(event.type)}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {format(parseISO(event.start_time), "yyyy년 MM월 dd일 (EEEE)", { locale: ko })}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {format(parseISO(event.start_time), "HH:mm")} ~ {format(parseISO(event.end_time), "HH:mm")}
            </span>
          </div>
          
          {event.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">{event.location}</span>
            </div>
          )}
          
          {event.description && (
            <div className="mt-4 p-4 bg-muted/30 rounded-md">
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          {isUserLoggedIn && (
            <>
              <Button 
                variant="outline" 
                onClick={onEdit}
                disabled={!canEditEvent}
              >
                수정
              </Button>
              <Button 
                variant="destructive" 
                onClick={onDelete}
                disabled={!canEditEvent}
              >
                삭제
              </Button>
            </>
          )}
          <Button onClick={() => onOpenChange(false)}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
