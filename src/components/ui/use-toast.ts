
import { useToast as useToastHook } from "@/hooks/use-toast";
import { toast as toastAction } from "sonner";

// Export the hook
export const useToast = useToastHook;

// Export both the original toast object and a function version
export function toast(message: string, options?: any) {
  if (typeof message === 'string') {
    return toastAction(message, options);
  } else {
    // Support for the old object-based API for backward compatibility
    const { title, description, variant, ...rest } = message as any;
    if (variant === 'destructive') {
      return toastAction.error(title, { description, ...rest });
    }
    return toastAction(title, { description, ...rest });
  }
}

// Add all the methods from the original toast
toast.success = toastAction.success;
toast.error = toastAction.error;
toast.info = toastAction.info;
toast.warning = toastAction.warning;
toast.loading = toastAction.loading;
toast.dismiss = toastAction.dismiss;
