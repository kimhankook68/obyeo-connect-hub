
import React from "react";
import { DonationReceipt } from "@/types/donation-receipt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check, Clock } from "lucide-react";

interface ReceiptDetailCardProps {
  receipt: DonationReceipt;
  isAuthor: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleProcessed?: (processed: boolean) => Promise<void>;
  processingStatus?: boolean;
}

const ReceiptDetailCard: React.FC<ReceiptDetailCardProps> = ({
  receipt,
  isAuthor,
  isAdmin,
  onEdit,
  onDelete,
  onToggleProcessed,
  processingStatus = false,
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            작성자: {receipt.author}
          </span>
          <span className="text-sm text-muted-foreground">
            신청일: {new Date(receipt.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={receipt.processed ? "success" : "outline"}
            className="flex gap-1 items-center"
          >
            {receipt.processed ? (
              <>
                <Check className="h-3 w-3" />
                발급완료
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                대기중
              </>
            )}
          </Badge>
          
          {/* Admin can toggle the processed status */}
          {isAdmin && (
            <Button 
              variant={receipt.processed ? "outline" : "secondary"}
              size="sm"
              onClick={() => onToggleProcessed && onToggleProcessed(!receipt.processed)}
              disabled={processingStatus}
              className="ml-2"
            >
              {receipt.processed ? (
                <>
                  <Clock className="h-4 w-4 mr-1" /> 
                  대기중으로 변경
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" /> 
                  {processingStatus ? "처리 중..." : "발급완료로 변경"}
                </>
              )}
            </Button>
          )}
          
          {/* Show edit/delete buttons only for author or admin */}
          {(isAuthor || isAdmin) && (
            <div className="flex gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4 mr-1" /> 수정
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" /> 삭제
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-4 p-4 bg-muted/30 rounded-md">
        <div className="mb-3">
          <span className="font-semibold">기부 금액:</span> {receipt.amount.toLocaleString()}원
        </div>
        <div className="whitespace-pre-wrap">{receipt.content}</div>
      </div>
    </div>
  );
};

export default ReceiptDetailCard;
