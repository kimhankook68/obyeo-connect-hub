
import React from "react";
import { format } from "date-fns";
import { Eye, FileIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface DocumentItemProps {
  document: {
    id: string;
    title: string;
    author?: string;
    description: string | null;
    file_path: string;
    file_type: string;
    file_size: number;
    created_at: string;
  };
  formatFileSize: (bytes: number) => string;
  onPreview: (doc: any) => void;
  onDownload: (doc: any) => void;
  onDelete: (doc: any) => void;
  isUserLoggedIn: boolean;
}

const DocumentItem = ({
  document,
  formatFileSize,
  onPreview,
  onDownload,
  onDelete,
  isUserLoggedIn,
}: DocumentItemProps) => {
  return (
    <TableRow key={document.id}>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-2 cursor-pointer hover:text-primary" onClick={() => onPreview(document)}>
          <FileIcon className="h-4 w-4 text-muted-foreground" />
          <span>{document.title}</span>
        </div>
        {document.description && (
          <div className="text-xs text-muted-foreground mt-1">
            {document.description}
          </div>
        )}
      </TableCell>
      <TableCell>{document.author || "미상"}</TableCell>
      <TableCell>{formatFileSize(document.file_size)}</TableCell>
      <TableCell>{format(new Date(document.created_at), 'yyyy-MM-dd')}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onPreview(document)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDownload(document)}>
            다운로드
          </Button>
          {isUserLoggedIn && (
            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(document)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default DocumentItem;
