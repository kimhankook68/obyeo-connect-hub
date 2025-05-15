
import { useReceiptData } from "./receipt/useReceiptData";
import { useReceiptComments } from "./receipt/useReceiptComments";
import { useReceiptActions } from "./receipt/useReceiptActions";

export const useDonationReceipt = (id?: string) => {
  const { 
    receipt, 
    loading, 
    user, 
    isAuthor, 
    isAdmin, 
    setReceipt 
  } = useReceiptData(id);
  
  const { 
    comments, 
    commentLoading, 
    handleSubmitComment: submitComment, 
    fetchComments 
  } = useReceiptComments(id);
  
  const { 
    processingStatus, 
    deleteDialogOpen, 
    deleteLoading, 
    setDeleteDialogOpen, 
    handleToggleProcessed, 
    handleEdit, 
    handleDelete 
  } = useReceiptActions(id, setReceipt);

  // Wrapper for handleSubmitComment to pass the current user
  const handleSubmitComment = async (comment: string) => {
    await submitComment(comment, user);
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
