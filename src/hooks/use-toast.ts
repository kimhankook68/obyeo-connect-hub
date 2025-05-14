
import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

// Helper function to convert our custom toast props to sonner format
const showToast = ({ title, description, variant, ...props }: ToastProps) => {
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      ...props,
    });
  } else {
    return sonnerToast(title, {
      description,
      ...props,
    });
  }
};

// Export a compatible toast function
export const toast = (props: ToastProps) => showToast(props);

// Add the direct methods that sonner provides
toast.success = sonnerToast.success;
toast.error = sonnerToast.error;
toast.info = sonnerToast.info;
toast.warning = sonnerToast.warning;
toast.loading = sonnerToast.loading;
toast.dismiss = sonnerToast.dismiss;

export const useToast = () => {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    toasts: []
  };
};
