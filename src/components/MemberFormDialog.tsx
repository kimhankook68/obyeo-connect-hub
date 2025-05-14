import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 부서 목록 정의
export const DEPARTMENTS = [
  "사무국",
  "사랑의집",
  "소망의집",
  "서울중구시니어클럽",
] as const;

// 유효성 검사 스키마
const formSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다"),
  email: z.string().email("유효한 이메일을 입력하세요"),
  department: z.enum(DEPARTMENTS, {
    required_error: "부서를 선택해주세요",
  }),
  role: z.string().min(1, "직책은 필수입니다"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editMember?: {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    phone?: string | null;
  };
}

export function MemberFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editMember,
}: MemberFormDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editMember?.name || "",
      email: editMember?.email || "",
      department: editMember?.department as any || undefined,
      role: editMember?.role || "",
      phone: editMember?.phone || "",
    },
  });

  // 폼 데이터 업데이트 (편집 모드일 때)
  React.useEffect(() => {
    if (editMember) {
      form.reset({
        name: editMember.name,
        email: editMember.email,
        department: editMember.department as any,
        role: editMember.role,
        phone: editMember.phone || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        department: undefined,
        role: "",
        phone: "",
      });
    }
  }, [editMember, form, open]);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    try {
      if (editMember) {
        // 기존 임직원 데이터 수정
        const { error } = await supabase
          .from("members")
          .update({
            name: values.name,
            email: values.email,
            department: values.department,
            role: values.role,
            phone: values.phone || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editMember.id);

        if (error) throw error;

        toast.success("임직원 정보가 성공적으로 수정되었습니다.");
      } else {
        // 새 UUID 생성
        const newId = crypto.randomUUID();
        
        // 새 임직원 데이터 삽입
        const { error } = await supabase.from("members").insert({
          id: newId,
          name: values.name,
          email: values.email,
          department: values.department,
          role: values.role,
          phone: values.phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast.success("새 임직원이 성공적으로 등록되었습니다.");
      }

      // 폼 초기화 및 대화상자 닫기
      form.reset();
      onOpenChange(false);
      
      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("임직원 등록/수정 오류:", error);
      toast.error(editMember ? "임직원 수정 실패" : "임직원 등록 실패", {
        description: "작업 중 오류가 발생했습니다."
      });
    }
  }

  const dialogTitle = editMember ? "임직원 정보 수정" : "임직원 등록";
  const dialogDescription = editMember ? 
    "임직원 정보를 수정하세요. 모든 필수 항목을 입력해야 합니다." : 
    "새로운 임직원 정보를 입력하세요. 모든 필수 항목을 입력해야 합니다.";
  const submitButtonText = editMember ? "수정" : "등록";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input placeholder="홍길동" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>부서</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="부서를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>직책</FormLabel>
                  <FormControl>
                    <Input placeholder="과장" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>연락처 (선택사항)</FormLabel>
                  <FormControl>
                    <Input placeholder="010-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "처리 중..." : submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
