
import React from "react";
import { useDocuments } from "@/hooks/useDocuments";
import DocumentItem from "@/components/documents/DocumentItem";
import DocumentPreview from "@/components/documents/DocumentPreview";
import DocumentEditDialog from "@/components/documents/DocumentEditDialog";
import { formatFileSize } from "@/components/documents/documentUtils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DocumentsList = () => {
  const {
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
  } = useDocuments();

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
              <DocumentItem
                key={doc.id}
                document={doc}
                formatFileSize={formatFileSize}
                onPreview={handlePreviewClick}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isUserLoggedIn={!!user}
                isOwner={isDocumentOwner(doc)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <DocumentPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        document={selectedDocument}
        onDownload={handleDownload}
      />

      <DocumentEditDialog
        document={editingDocument}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEdit}
      />
    </>
  );
};

export default DocumentsList;
