
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchDocumentAuthor, downloadDocument, deleteDocument } from "@/components/documents/documentUtils";

interface Document {
  id: string;
  title: string;
  author?: string;
  description: string | null;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  user_id?: string;
}

interface DocumentUpdateData {
  title: string;
  description: string | null;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
    
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    getUser();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add author information to documents
      const documentsWithAuthors = await Promise.all((data || []).map(async (doc) => {
        const author = await fetchDocumentAuthor(doc.user_id);
        return { ...doc, author };
      }));
      
      setDocuments(documentsWithAuthors);
    } catch (error: any) {
      console.error('문서 로딩 오류:', error);
      toast.error("문서 로딩 실패", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const success = await downloadDocument(doc);
      if (!success) {
        throw new Error("다운로드에 실패했습니다.");
      }
    } catch (error: any) {
      toast.error("파일 다운로드 실패", {
        description: error.message
      });
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!user) {
      toast.error("로그인이 필요합니다", {
        description: "파일 삭제를 위해 로그인해주세요"
      });
      return;
    }
    
    if (!window.confirm('정말로 이 파일을 삭제하시겠습니까?')) return;

    try {
      const success = await deleteDocument(doc);
      
      if (!success) {
        throw new Error("삭제에 실패했습니다.");
      }

      // 3. 목록 업데이트
      setDocuments(documents.filter(d => d.id !== doc.id));
      
      toast.success("파일이 삭제되었습니다");
    } catch (error: any) {
      toast.error("파일 삭제 실패", {
        description: error.message
      });
    }
  };

  const handleEdit = (doc: Document) => {
    setEditingDocument(doc);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (id: string, data: DocumentUpdateData) => {
    if (!user) {
      toast.error("로그인이 필요합니다", {
        description: "파일 수정을 위해 로그인해주세요"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          title: data.title,
          description: data.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      // Update documents list
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === id 
            ? { ...doc, title: data.title, description: data.description } 
            : doc
        )
      );
      
      // If the edited document is currently selected for preview, update it
      if (selectedDocument?.id === id) {
        setSelectedDocument(prev => 
          prev ? { ...prev, title: data.title, description: data.description } : null
        );
      }
      
      toast.success("문서가 수정되었습니다");
    } catch (error: any) {
      console.error('문서 수정 오류:', error);
      toast.error("문서 수정 실패", {
        description: error.message || "알 수 없는 오류가 발생했습니다"
      });
      throw error;
    }
  };

  const handlePreviewClick = (doc: Document) => {
    setSelectedDocument(doc);
    setPreviewOpen(true);
  };

  const isDocumentOwner = (doc: Document) => {
    return user && doc.user_id === user.id;
  };

  return {
    documents,
    loading,
    selectedDocument,
    editingDocument,
    previewOpen,
    setPreviewOpen,
    editDialogOpen,
    setEditDialogOpen,
    user,
    handleDownload,
    handleDelete,
    handleEdit,
    handleSaveEdit,
    handlePreviewClick,
    isDocumentOwner
  };
};
