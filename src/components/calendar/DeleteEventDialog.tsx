
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { toast } from "sonner";

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  event: CalendarEvent | null;
}

const DeleteEventDialog: React.FC<DeleteEventDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  event,
}) => {
  // 직접 삭제 처리 함수
  const handleDeleteConfirm = () => {
    try {
      console.log("Confirming delete for event:", event?.id, event?.title);
      
      // 이벤트가 null이 아님을 확인
      if (event && event.id) {
        // 확인 핸들러 호출
        onConfirm();
      } else {
        console.error("Cannot delete: No event selected or invalid event ID");
        toast.error("삭제할 일정을 찾을 수 없습니다");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error in delete confirmation:", error);
      toast.error("일정 삭제 중 오류가 발생했습니다");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>이 일정을 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            "{event?.title}" 일정이 완전히 삭제됩니다. 이 작업은 취소할 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm}>삭제</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEventDialog;
