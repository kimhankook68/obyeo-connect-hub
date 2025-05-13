
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

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
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
      toast({
        title: "문서 로딩 실패",
        description: error.message,
        variant: "destructive",
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
      toast({
        title: "파일 다운로드 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "파일 삭제를 위해 로그인해주세요",
        variant: "destructive",
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
      
      toast({
        title: "파일이 삭제되었습니다",
      });
    } catch (error: any) {
      toast({
        title: "파일 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePreviewClick = (doc: Document) => {
    setSelectedDocument(doc);
    setPreviewOpen(true);
  };

  return {
    documents,
    loading,
    selectedDocument,
    previewOpen,
    setPreviewOpen,
    user,
    handleDownload,
    handleDelete,
    handlePreviewClick
  };
};
