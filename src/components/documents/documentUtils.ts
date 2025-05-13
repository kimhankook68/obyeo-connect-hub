
import { supabase } from "@/integrations/supabase/client";

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
};

export const fetchDocumentAuthor = async (userId: string | undefined | null) => {
  if (!userId) return "Unknown";
  
  try {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .single();
    
    if (error || !profileData) {
      return "Unknown";
    }
    
    // Use the profile name or the first part of the email
    const authorName = profileData.name || 
                       (profileData.email ? profileData.email.split('@')[0] : null);
                       
    return authorName || "Unknown";
  } catch (error) {
    console.error('Error fetching author:', error);
    return "Unknown";
  }
};

export const downloadDocument = async (doc: any) => {
  try {
    const { data, error } = await supabase
      .storage
      .from('documents')
      .download(doc.file_path);

    if (error) throw error;

    // 파일 다운로드
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.title;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
    
    return true;
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    return false;
  }
};

export const deleteDocument = async (doc: any) => {
  try {
    // 1. DB에서 문서 메타데이터 삭제
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', doc.id);

    if (dbError) throw dbError;

    // 2. 스토리지에서 파일 삭제
    const { error: storageError } = await supabase
      .storage
      .from('documents')
      .remove([doc.file_path]);

    if (storageError) throw storageError;
    
    return true;
  } catch (error) {
    console.error('파일 삭제 오류:', error);
    return false;
  }
};
