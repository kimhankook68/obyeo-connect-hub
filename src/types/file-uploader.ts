
export interface FileUploaderProps {
  onFileSelected: (files: FileList | null) => void;
  className?: string;
  accept?: string;
  multiple?: boolean;
}
