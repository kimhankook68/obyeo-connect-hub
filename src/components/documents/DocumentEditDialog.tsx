
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface DocumentEditDialogProps {
  document: {
    id: string;
    title: string;
    description: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: { title: string; description: string | null }) => Promise<void>;
}

const DocumentEditDialog = ({ document, open, onOpenChange, onSave }: DocumentEditDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when document changes
  React.useEffect(() => {
    if (document) {
      setTitle(document.title);
      setDescription(document.description || "");
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;
    
    try {
      setIsSaving(true);
      await onSave(document.id, { 
        title, 
        description: description.trim() ? description : null 
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save document:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>문서 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">제목</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="파일 제목"
              required
            />
          </div>
          
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium mb-1">설명 (선택사항)</label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="파일에 대한 설명"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              취소
            </Button>
            <Button type="submit" disabled={isSaving || !title.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentEditDialog;
