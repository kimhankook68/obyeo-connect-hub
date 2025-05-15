
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { DashboardCard } from "@/components/DashboardCard";
import { ArrowLeft } from "lucide-react";
import { DonationReceipt } from "@/types/donation-receipt";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  amount: z.string().min(1, "금액을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
});

const DonationReceiptEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      content: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        if (!id || !user) return;

        const { data, error } = await supabase
          .from("donation_receipts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        if (data) {
          setReceipt(data as DonationReceipt);
          
          // Check if user is author or admin
          const isAuthor = data.user_id === user.id;
          
          // Check if user is admin
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
            
          const isAdmin = profileData?.role === 'admin';
          
          // Set authorization state
          setIsAuthorized(isAuthor || isAdmin);
          
          if (!isAuthor && !isAdmin) {
            toast.error("수정 권한이 없습니다.");
            navigate(`/donation-receipts/${id}`);
            return;
          }
          
          // Set form values
          form.reset({
            title: data.title,
            amount: data.amount.toString(),
            content: data.content,
          });
        }
      } catch (error) {
        console.error("Error fetching donation receipt:", error);
        toast.error("영수증 정보를 불러오는데 실패했습니다.");
        navigate(`/donation-receipts/${id}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReceipt();
    }
  }, [id, user, form, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id || !isAuthorized) return;
    
    try {
      setSubmitLoading(true);
      
      const { error } = await supabase
        .from("donation_receipts")
        .update({
          title: values.title,
          amount: parseFloat(values.amount),
          content: values.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("기부금영수증이 수정되었습니다.");
      navigate(`/donation-receipts/${id}`);
      
    } catch (error) {
      console.error("Error updating donation receipt:", error);
      toast.error("수정에 실패했습니다.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="기부금영수증 수정" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/donation-receipts/${id}`)} 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 상세보기로 돌아가기
          </Button>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
            </div>
          ) : isAuthorized && receipt ? (
            <DashboardCard title="기부금영수증 수정" className="max-w-2xl mx-auto">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>제목</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="제목을 입력하세요" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>기부 금액</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              placeholder="금액을 입력하세요" 
                              type="number"
                              min="0"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">원</div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>내용</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="내용을 입력하세요" 
                            className="min-h-[200px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/donation-receipts/${id}`)}
                      disabled={submitLoading}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <span className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></span>
                          저장 중...
                        </>
                      ) : (
                        "저장"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DashboardCard>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              영수증 정보를 불러오는 중이거나 권한이 없습니다.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DonationReceiptEdit;
