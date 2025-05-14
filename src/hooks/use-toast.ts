
import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export const toast = sonnerToast;

export const useToast = () => {
  return {
    toast: sonnerToast,
    dismiss: sonnerToast.dismiss,
    toasts: []
  };
};
