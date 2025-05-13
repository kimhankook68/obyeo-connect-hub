
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileIcon, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Document {
  id: string;
  title: string;
  author?: string; // Added author field
  description: string | null;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

const DocumentsList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

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
      setDocuments(data || []);
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
      const { data, error } = await supabase
        .storage
        .from('documents')
        .download(doc.file_path);

      if (error) throw error;

      // 파일 다운로드
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (error: any) {
      console.error('파일 다운로드 오류:', error);
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
      // 1. DB에서 문서 메타데이터 삭제
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      // 2. 스토리지에서 파일 삭제
      const { error: storageError } = await supabase
        .storage
        .from('documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // 3. 목록 업데이트
      setDocuments(documents.filter(d => d.id !== doc.id));
      
      toast({
        title: "파일이 삭제되었습니다",
      });
    } catch (error: any) {
      console.error('파일 삭제 오류:', error);
      toast({
        title: "파일 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePreviewClick = async (doc: Document) => {
    setSelectedDocument(doc);
    setPreviewOpen(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        등록된 문서가 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>파일명</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>크기</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2 cursor-pointer hover:text-primary" onClick={() => handlePreviewClick(doc)}>
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{doc.title}</span>
                  </div>
                  {doc.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {doc.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>{doc.author || "미상"}</TableCell>
                <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                <TableCell>{format(new Date(doc.created_at), 'yyyy-MM-dd')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handlePreviewClick(doc)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                      다운로드
                    </Button>
                    {user && (
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(doc)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 문서 미리보기 대화상자 */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.author ? `작성자: ${selectedDocument.author} | ` : ''}
              {selectedDocument && format(new Date(selectedDocument.created_at), 'yyyy-MM-dd')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {selectedDocument?.description && (
              <div className="mb-4 p-4 bg-muted rounded-md text-sm">
                {selectedDocument.description}
              </div>
            )}
            
            {selectedDocument && (
              <div className="flex flex-col items-center">
                {selectedDocument.file_type.startsWith('image/') ? (
                  <div className="relative w-full mb-4 max-h-[500px] overflow-auto">
                    <img 
                      src={`https://crfvlilmnsovojvcihlq.supabase.co/storage/v1/object/public/documents/${selectedDocument.file_path}`}
                      alt={selectedDocument.title}
                      className="max-w-full mx-auto"
                    />
                  </div>
                ) : selectedDocument.file_type.startsWith('application/pdf') ? (
                  <iframe
                    src={`https://crfvlilmnsovojvcihlq.supabase.co/storage/v1/object/public/documents/${selectedDocument.file_path}`}
                    className="w-full h-[500px] border-0"
                    title={selectedDocument.title}
                  />
                ) : selectedDocument.file_type.startsWith('text/') ? (
                  <div className="w-full h-[300px] p-4 bg-muted rounded-md overflow-auto text-sm">
                    <p>텍스트 파일 미리보기</p>
                    {/* 텍스트 파일을 불러오는 코드가 필요할 수 있습니다 */}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p>이 파일 형식은 미리보기를 지원하지 않습니다.</p>
                  </div>
                )}
                
                <Button 
                  onClick={() => handleDownload(selectedDocument)} 
                  className="mt-4">
                  파일 다운로드
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentsList;
