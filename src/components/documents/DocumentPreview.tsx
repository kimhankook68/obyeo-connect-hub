
import React from "react";
import { format } from "date-fns";
import { FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    id: string;
    title: string;
    author?: string;
    description: string | null;
    file_path: string;
    file_type: string;
    file_size: number;
    created_at: string;
  } | null;
  onDownload: (doc: any) => void;
}

const DocumentPreview = ({
  open,
  onOpenChange,
  document,
  onDownload,
}: DocumentPreviewProps) => {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{document.title}</DialogTitle>
          <DialogDescription>
            {document.author ? `작성자: ${document.author} | ` : ''}
            {format(new Date(document.created_at), 'yyyy-MM-dd')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {document.description && (
            <div className="mb-4 p-4 bg-muted rounded-md text-sm">
              {document.description}
            </div>
          )}
          
          <div className="flex flex-col items-center">
            {document.file_type.startsWith('image/') ? (
              <div className="relative w-full mb-4 max-h-[500px] overflow-auto">
                <img 
                  src={`https://crfvlilmnsovojvcihlq.supabase.co/storage/v1/object/public/documents/${document.file_path}`}
                  alt={document.title}
                  className="max-w-full mx-auto"
                />
              </div>
            ) : document.file_type.startsWith('application/pdf') ? (
              <iframe
                src={`https://crfvlilmnsovojvcihlq.supabase.co/storage/v1/object/public/documents/${document.file_path}`}
                className="w-full h-[500px] border-0"
                title={document.title}
              />
            ) : document.file_type.startsWith('text/') ? (
              <div className="w-full h-[300px] p-4 bg-muted rounded-md overflow-auto text-sm">
                <p>텍스트 파일 미리보기</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p>이 파일 형식은 미리보기를 지원하지 않습니다.</p>
              </div>
            )}
            
            <Button 
              onClick={() => onDownload(document)} 
              className="mt-4">
              파일 다운로드
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreview;
