
import React from "react";
import { DonationReceipt } from "@/types/donation-receipt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ReceiptDetailCardProps {
  receipt: DonationReceipt;
  isAuthor: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const ReceiptDetailCard: React.FC<ReceiptDetailCardProps> = ({
  receipt,
  isAuthor,
  isAdmin,
  onEdit,
  onDelete,
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
          <Badge variant={receipt.processed ? "success" : "outline"}>
            {receipt.processed ? "처리완료" : "대기중"}
          </Badge>
          
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
