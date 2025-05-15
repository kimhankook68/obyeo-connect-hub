
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { DashboardCard } from "@/components/DashboardCard";
import { ArrowLeft } from "lucide-react";

const DonationReceiptCreate = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !amount.trim()) {
      toast.error("모든 필드를 채워주세요.");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const numAmount = parseFloat(amount.replace(/,/g, ""));
      if (isNaN(numAmount) || numAmount <= 0) {
        toast.error("올바른 금액을 입력해주세요.");
        return;
      }

      const { error } = await supabase
        .from("donation_receipts")
        .insert({
          title,
          content,
          amount: numAmount,
          user_id: user?.id,
          author: user?.user_metadata?.name || user?.email?.split('@')[0] || '방문자',
          processed: false
        });

      if (error) throw error;
      
      toast.success("기부금영수증 신청이 완료되었습니다.");
      navigate("/donation-receipts");
    } catch (error) {
      console.error("Error creating donation receipt:", error);
      toast.error("영수증 신청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatAmount = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/[^0-9]/g, "");
    // Format with commas
    return numbers === "" ? "" : parseInt(numbers).toLocaleString();
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="기부금영수증 신청" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/donation-receipts")} 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로
          </Button>
          
          <DashboardCard title="기부금영수증 신청" className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="영수증 신청 제목"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">기부 금액</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(formatAmount(e.target.value))}
                    placeholder="0"
                    required
                    className="pl-8"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    ₩
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">신청 내용</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="영수증 신청 내용을 작성해주세요. (기부 날짜, 기부 목적 등)"
                  className="min-h-[150px]"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => navigate("/donation-receipts")}
                >
                  취소
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "신청 중..." : "신청하기"}
                </Button>
              </div>
            </form>
          </DashboardCard>
        </main>
      </div>
    </div>
  );
};

export default DonationReceiptCreate;
