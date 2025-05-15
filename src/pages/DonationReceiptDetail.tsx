
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { DashboardCard } from "@/components/DashboardCard";
import CommentList from "@/components/CommentList";
import { ArrowLeft, Download } from "lucide-react";
import { useDonationReceipt } from "@/hooks/useDonationReceipt";
import ReceiptDetailCard from "@/components/donation/ReceiptDetailCard";
import DeleteReceiptDialog from "@/components/donation/DeleteReceiptDialog";
import CommentForm from "@/components/donation/CommentForm";

const DonationReceiptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    receipt,
    comments,
    loading,
    commentLoading,
    isAuthor,
    isAdmin,
    deleteDialogOpen,
    deleteLoading,
    setDeleteDialogOpen,
    handleSubmitComment,
    downloadReceipt,
    handleEdit,
    handleDelete
  } = useDonationReceipt(id);

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="기부금영수증 상세" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/donation-receipts")} 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로
          </Button>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
            </div>
          ) : receipt ? (
            <>
              <DashboardCard title={receipt.title} className="mb-6">
                <ReceiptDetailCard 
                  receipt={receipt}
                  isAuthor={isAuthor}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={() => setDeleteDialogOpen(true)}
                />
                
                <div className="border-t border-border pt-4">
                  <h3 className="text-lg font-medium mb-4">댓글</h3>
                  <CommentList comments={comments.map(c => ({
                    id: c.id,
                    author: c.author,
                    content: c.attachment_url ? 
                      <div>
                        <div>{c.content}</div>
                        {c.attachment_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => downloadReceipt(c.attachment_url!, '기부금영수증.pdf')}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            영수증 다운로드
                          </Button>
                        )}
                      </div> : 
                      c.content,
                    created_at: c.created_at
                  }))} />
                  
                  <CommentForm 
                    onSubmit={handleSubmitComment}
                    loading={commentLoading}
                  />
                </div>
              </DashboardCard>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              영수증 정보를 찾을 수 없습니다.
            </div>
          )}
        </main>
      </div>
      
      <DeleteReceiptDialog
        open={deleteDialogOpen}
        loading={deleteLoading}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default DonationReceiptDetail;
