
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DonationReceipt, DonationReceiptComment } from "@/types/donation-receipt";
import { toast } from "sonner";

export const useDonationReceipt = (id?: string) => {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const [comments, setComments] = useState<DonationReceiptComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      // Check if user is admin
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        setIsAdmin(data?.role === 'admin');
      }
    };
    
    fetchUser();
    
    if (id) {
      fetchReceipt();
      fetchComments();
    }
  }, [id]);

  useEffect(() => {
    // Check if current user is the author
    if (user && receipt) {
      setIsAuthor(user.id === receipt.user_id);
    }
  }, [user, receipt]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      if (!id) return;

      const { data, error } = await supabase
        .from("donation_receipts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        setReceipt(data as DonationReceipt);
      }
    } catch (error) {
      console.error("Error fetching donation receipt:", error);
      toast.error("영수증 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from("donation_receipt_comments")
        .select("*")
        .eq("receipt_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      if (data) {
        setComments(data as DonationReceiptComment[]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmitComment = async (comment: string) => {
    try {
      setCommentLoading(true);
      
      // Insert comment
      const { error } = await supabase.from("donation_receipt_comments").insert({
        receipt_id: id,
        user_id: user?.id,
        author: user?.user_metadata?.name || user?.email?.split('@')[0] || '방문자',
        content: comment,
      });

      if (error) throw error;
      
      toast.success("댓글이 등록되었습니다.");
      fetchComments();
      
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("댓글 등록에 실패했습니다.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleToggleProcessed = async (processed: boolean) => {
    try {
      if (!id || !isAdmin) return;
      
      setProcessingStatus(true);
      
      const { error } = await supabase
        .from("donation_receipts")
        .update({ processed })
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local receipt status
      if (receipt) {
        setReceipt({ ...receipt, processed });
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
    receipt,
    comments,
    loading,
    commentLoading,
    processingStatus,
    user,
    isAuthor,
    isAdmin,
    deleteDialogOpen,
    deleteLoading,
    setDeleteDialogOpen,
    handleSubmitComment,
    handleToggleProcessed,
    handleEdit,
    handleDelete,
  };
};
