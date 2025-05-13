
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { FileIcon, Upload } from "lucide-react";

type Document = {
  id: string;
  title: string;
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
        .select('id, title, file_type, created_at')
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
            <div key={doc.id} className="flex items-center justify-between p-3 border border-border rounded-md">
              <div className="flex items-center gap-3">
                <FileIcon className="h-4 w-4 text-muted-foreground" />
                <span>{doc.title}</span>
              </div>
              <div className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/documents')}>
            <Upload className="h-4 w-4 mr-2" /> 파일 업로드
          </Button>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          등록된 자료가 없습니다.
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/documents')}>
              <Upload className="h-4 w-4 mr-2" /> 파일 업로드
            </Button>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

export default RecentDocuments;
