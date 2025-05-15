
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { ReceiptIcon, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { DashboardCard } from "@/components/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { DonationReceipt } from "@/types/donation-receipt";

const DonationReceipts = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [receipts, setReceipts] = useState<DonationReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("donation_receipts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error("Error fetching donation receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="기부금영수증" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">기부금영수증</h1>
            <Button onClick={() => navigate("/donation-receipts/create")}>
              <Plus className="mr-2 h-4 w-4" /> 영수증 신청
            </Button>
          </div>
          
          <DashboardCard title="기부금영수증 신청 목록" className="mb-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ReceiptIcon className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p>기부금영수증 신청 내역이 없습니다.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/donation-receipts/create")}
                >
                  영수증 신청하기
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>신청일</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="w-[100px]">작성자</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.map((receipt) => (
                      <TableRow
                        key={receipt.id}
                        onClick={() => navigate(`/donation-receipts/${receipt.id}`)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{receipt.title}</TableCell>
                        <TableCell>
                          {new Date(receipt.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {receipt.amount.toLocaleString()}원
                        </TableCell>
                        <TableCell>
                          <Badge variant={receipt.processed ? "success" : "outline"}>
                            {receipt.processed ? "처리완료" : "대기중"}
                          </Badge>
                        </TableCell>
                        <TableCell>{receipt.author}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DashboardCard>
        </main>
      </div>
    </div>
  );
};

export default DonationReceipts;
