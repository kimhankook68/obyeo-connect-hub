
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DonationReceipt } from "@/types/donation-receipt";
import { toast } from "sonner";

export const useReceiptData = (id?: string) => {
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      // Check if user is admin
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        setIsAdmin(data?.role === 'admin');
      }
    };
    
    fetchUser();
    
    if (id) {
      fetchReceipt();
    }
  }, [id]);

  useEffect(() => {
    // Check if current user is the author
    if (user && receipt) {
      setIsAuthor(user.id === receipt.user_id);
    }
  }, [user, receipt]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      if (!id) return;

      const { data, error } = await supabase
        .from("donation_receipts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        console.log("Fetched receipt data:", data);
        setReceipt(data as DonationReceipt);
      }
    } catch (error) {
      console.error("Error fetching donation receipt:", error);
      toast.error("영수증 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return {
    receipt,
    loading,
    user,
    isAuthor,
    isAdmin,
    setReceipt,
  };
};
