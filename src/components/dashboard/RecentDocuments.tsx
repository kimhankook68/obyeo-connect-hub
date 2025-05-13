
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { FileIcon } from "lucide-react";

type Document = {
  id: string;
  title: string;
  author?: string;
  file_type: string;
  created_at: string;
};

const RecentDocuments = () => {
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchRecentDocuments();
  }, []);
  
  const fetchRecentDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, author, file_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        throw error;
      }

      setRecentDocuments(data || []);
    } catch (error) {
      console.error('최근 자료를 가져오는 중 오류가 발생했습니다:', error);
      toast({
        title: "데이터 로드 실패",
        description: "최근 자료를 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoadingDocuments(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };

  const handleDocumentClick = (id: string) => {
    navigate(`/documents?document=${id}`);
  };
  
  return (
    <DashboardCard 
      title="자료실" 
      action={<Button variant="ghost" size="sm" onClick={() => navigate('/documents')}>더보기</Button>}
    >
      {loadingDocuments ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : recentDocuments.length > 0 ? (
        <div className="space-y-3">
          {recentDocuments.map(doc => (
            <div 
              key={doc.id} 
              className="flex items-center justify-between p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50"
              onClick={() => handleDocumentClick(doc.id)}
            >
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <FileIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="truncate font-medium">{doc.title}</div>
                  {doc.author && (
                    <div className="text-xs text-muted-foreground truncate">작성자: {doc.author}</div>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground pl-3">{formatDate(doc.created_at)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          등록된 자료가 없습니다.
        </div>
      )}
    </DashboardCard>
  );
};

export default RecentDocuments;
