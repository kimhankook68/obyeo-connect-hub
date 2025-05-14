
import { useToast as useToastHook } from "@/hooks/use-toast";
import { toast as toastAction } from "sonner";

export const useToast = useToastHook;
export const toast = toastAction;
