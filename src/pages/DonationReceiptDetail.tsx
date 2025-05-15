
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { DashboardCard } from "@/components/DashboardCard";
import CommentList from "@/components/CommentList";
import { DonationReceipt, DonationReceiptComment } from "@/types/donation-receipt";
import { Badge } from "@/components/ui/badge";
import FileUploader from "@/components/FileUploader";
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Trash2, 
  AlertTriangle 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DonationReceiptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const [comments, setComments] = useState<DonationReceiptComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      // Check if user is admin (you'll need to define this check based on your system)
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
    fetchReceipt();
    fetchComments();
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && !file) return;
    
    try {
      setCommentLoading(true);
      
      let attachment_url = null;
      
      // Upload file if provided
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from("donation_receipts")
          .upload(fileName, file);
          
        if (fileError) throw fileError;
        
        const { data } = supabase.storage
          .from("donation_receipts")
          .getPublicUrl(fileName);
          
        attachment_url = data.publicUrl;
      }
      
      // Insert comment
      const { error } = await supabase.from("donation_receipt_comments").insert({
        receipt_id: id,
        user_id: user?.id,
        author: user?.user_metadata?.name || user?.email?.split('@')[0] || '방문자',
        content: newComment,
        attachment_url
      });

      if (error) throw error;
      
      toast.success("댓글이 등록되었습니다.");
      setNewComment("");
      setFile(null);
      fetchComments();
      
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("댓글 등록에 실패했습니다.");
    } finally {
      setCommentLoading(false);
    }
  };

  const downloadReceipt = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("파일 다운로드에 실패했습니다.");
    }
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setFile(files[0]);
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
                          onClick={handleEdit}
                        >
                          <Edit className="h-4 w-4 mr-1" /> 수정
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setDeleteDialogOpen(true)}
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
                  
                  <form onSubmit={handleSubmitComment} className="mt-4">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                      className="mb-3"
                    />
                    <div className="flex gap-2">
                      <FileUploader 
                        onFileSelected={handleFileChange}
                        className="flex-grow"
                      />
                      {file && (
                        <div className="text-sm text-muted-foreground self-center">
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button 
                        type="submit" 
                        disabled={commentLoading || (!newComment.trim() && !file)}
                      >
                        {commentLoading ? "제출 중..." : "댓글 작성"}
                      </Button>
                    </div>
                  </form>
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
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
    </div>
  );
};

export default DonationReceiptDetail;
