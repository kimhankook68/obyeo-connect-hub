
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DonationReceiptComment } from "@/types/donation-receipt";
import { toast } from "sonner";

export const useReceiptComments = (id?: string) => {
  const [comments, setComments] = useState<DonationReceiptComment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id]);

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

  const handleSubmitComment = async (comment: string, user: any) => {
    try {
      setCommentLoading(true);
      
      if (!id || !user) {
        toast.error("댓글을 등록할 수 없습니다.");
        return;
      }
      
      // Insert comment
      const { error } = await supabase.from("donation_receipt_comments").insert({
        receipt_id: id,
        user_id: user.id,
        author: user.user_metadata?.name || user.email?.split('@')[0] || '방문자',
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

  return {
    comments,
    commentLoading,
    handleSubmitComment,
    fetchComments,
  };
};
