
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteReceiptDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteReceiptDialog: React.FC<DeleteReceiptDialogProps> = ({
  open,
  loading,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>기부금영수증 삭제</DialogTitle>
          <DialogDescription>
            <div className="flex items-center pt-2 text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>이 작업은 되돌릴 수 없습니다.</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          정말로 이 기부금영수증을 삭제하시겠습니까?<br />
          모든 관련 댓글도 함께 삭제됩니다.
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></span>
                삭제 중...
              </>
            ) : (
              "삭제"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteReceiptDialog;
