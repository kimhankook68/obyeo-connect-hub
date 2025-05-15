
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DonationReceipt } from "@/types/donation-receipt";
import { toast } from "sonner";

export const useReceiptActions = (id?: string, setReceipt?: (receipt: DonationReceipt) => void) => {
  const navigate = useNavigate();
  const [processingStatus, setProcessingStatus] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const handleToggleProcessed = async (processed: boolean) => {
    try {
      if (!id) return;
      
      setProcessingStatus(true);
      
      const { error } = await supabase
        .from("donation_receipts")
        .update({ processed })
        .eq("id", id);
      
      if (error) throw error;
      
      // Fetch updated receipt to reflect changes
      const { data } = await supabase
        .from("donation_receipts")
        .select("*")
        .eq("id", id)
        .single();
      
      if (data && setReceipt) {
        // 중요: 여기서 receipt 상태를 업데이트합니다
        setReceipt(data as DonationReceipt);
      }
      
      toast.success(processed ? "발급 완료 처리되었습니다." : "대기중으로 변경되었습니다.");
      
    } catch (error) {
      console.error("Error updating receipt status:", error);
      toast.error("상태 변경에 실패했습니다.");
    } finally {
      setProcessingStatus(false);
    }
  };

  const handleEdit = () => {
    navigate(`/donation-receipts/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!id || deleteLoading) return;
    
    try {
      setDeleteLoading(true);
      
      // Delete associated comments first
      const { error: commentsError } = await supabase
        .from("donation_receipt_comments")
        .delete()
        .eq("receipt_id", id);
      
      if (commentsError) throw commentsError;
      
      // Delete the receipt
      const { error } = await supabase
        .from("donation_receipts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("기부금영수증이 삭제되었습니다.");
      navigate("/donation-receipts");
      
    } catch (error) {
      console.error("Error deleting donation receipt:", error);
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return {
    processingStatus,
    deleteDialogOpen,
    deleteLoading,
    setDeleteDialogOpen,
    handleToggleProcessed,
    handleEdit,
    handleDelete,
  };
};
