
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BookmarkIcon, PencilIcon, Trash2Icon, PlusIcon, ExternalLinkIcon } from "lucide-react";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

const Bookmarks = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookmark, setCurrentBookmark] = useState<Partial<Bookmark>>({});
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get current user and fetch bookmarks
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user.id);
        fetchBookmarks();
      } else {
        // Handle not authenticated case
        toast({
          title: "인증 필요",
          description: "즐겨찾기를 사용하기 위해서는 로그인이 필요합니다.",
          variant: "destructive",
        });
        // Optionally redirect to login
        // navigate('/auth');
      }
    };
    
    checkUser();
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setBookmarks(data || []);
    } catch (error: any) {
      console.error("Error fetching bookmarks:", error.message);
      toast({
        title: "오류 발생",
        description: "즐겨찾기를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (bookmark?: Bookmark) => {
    if (bookmark) {
      setIsEditing(true);
      setCurrentBookmark(bookmark);
    } else {
      setIsEditing(false);
      setCurrentBookmark({ title: "", url: "", description: "" });
    }
    setDialogOpen(true);
  };

  const validateUrl = (url: string) => {
    if (!/^https?:\/\//i.test(url)) {
      return `http://${url}`;
    }
    return url;
  };

  const handleSaveBookmark = async () => {
    try {
      if (!currentBookmark.title || !currentBookmark.url) {
        toast({
          title: "필수 항목 누락",
          description: "제목과 URL은 필수 입력 항목입니다.",
          variant: "destructive",
        });
        return;
      }

      if (!currentUser) {
        toast({
          title: "인증 필요",
          description: "즐겨찾기를 저장하기 위해서는 로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      // Make sure URL has protocol
      const formattedUrl = validateUrl(currentBookmark.url);
      
      if (isEditing && currentBookmark.id) {
        const { error } = await supabase
          .from('bookmarks')
          .update({ 
            title: currentBookmark.title, 
            url: formattedUrl, 
            description: currentBookmark.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentBookmark.id);

        if (error) throw error;

        toast({
          title: "즐겨찾기 수정 완료",
          description: "즐겨찾기가 성공적으로 수정되었습니다.",
        });
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            title: currentBookmark.title,
            url: formattedUrl,
            description: currentBookmark.description,
            user_id: currentUser
          });

        if (error) throw error;

        toast({
          title: "즐겨찾기 추가 완료",
          description: "즐겨찾기가 성공적으로 추가되었습니다.",
        });
      }

      setDialogOpen(false);
      fetchBookmarks();
    } catch (error: any) {
      console.error("Error saving bookmark:", error.message);
      toast({
        title: "오류 발생",
        description: "즐겨찾기 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "즐겨찾기 삭제 완료",
        description: "즐겨찾기가 성공적으로 삭제되었습니다.",
      });
      fetchBookmarks();
    } catch (error: any) {
      console.error("Error deleting bookmark:", error.message);
      toast({
        title: "오류 발생",
        description: "즐겨찾기 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleVisitBookmark = (url: string) => {
    window.open(validateUrl(url), "_blank", "noopener,noreferrer");
  };

  const renderBookmarksList = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border border-border rounded-lg p-4 mb-4">
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ));
    }

    if (bookmarks.length === 0) {
      return (
        <div className="text-center py-10">
          <BookmarkIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">즐겨찾기가 없습니다</h3>
          <p className="text-muted-foreground">자주 사용하는 웹사이트를 추가하세요</p>
          <Button className="mt-4" onClick={() => handleOpenDialog()}>
            <PlusIcon className="mr-2 h-4 w-4" /> 즐겨찾기 추가
          </Button>
        </div>
      );
    }

    return bookmarks.map((bookmark) => (
      <div key={bookmark.id} className="border border-border rounded-lg p-4 mb-4 bg-card hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-lg flex items-center">
              <BookmarkIcon className="mr-2 h-5 w-5 text-blue-500" />
              {bookmark.title}
            </h3>
            <a 
              href={validateUrl(bookmark.url)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground text-sm hover:text-blue-500 flex items-center mt-1"
            >
              {bookmark.url} <ExternalLinkIcon className="ml-1 h-3 w-3" />
            </a>
            {bookmark.description && (
              <p className="text-sm mt-2">{bookmark.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(bookmark)}>
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">편집</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteBookmark(bookmark.id)}>
              <Trash2Icon className="h-4 w-4 text-destructive" />
              <span className="sr-only">삭제</span>
            </Button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="즐겨찾기" 
          rightContent={
            <Button onClick={() => handleOpenDialog()}>
              <PlusIcon className="mr-2 h-4 w-4" /> 즐겨찾기 추가
            </Button>
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-4xl mx-auto">
            {renderBookmarksList()}
          </div>
        </main>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "즐겨찾기 수정" : "즐겨찾기 추가"}</DialogTitle>
            <DialogDescription>
              자주 방문하는 웹사이트를 추가하고 관리하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                사이트명 *
              </label>
              <Input
                id="title"
                value={currentBookmark.title || ""}
                onChange={(e) => setCurrentBookmark({...currentBookmark, title: e.target.value})}
                placeholder="사이트 이름을 입력하세요"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="url" className="text-sm font-medium">
                URL *
              </label>
              <Input
                id="url"
                value={currentBookmark.url || ""}
                onChange={(e) => setCurrentBookmark({...currentBookmark, url: e.target.value})}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                설명
              </label>
              <Input
                id="description"
                value={currentBookmark.description || ""}
                onChange={(e) => setCurrentBookmark({...currentBookmark, description: e.target.value})}
                placeholder="사이트에 대한 설명을 입력하세요"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button type="button" onClick={handleSaveBookmark}>
              {isEditing ? "업데이트" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookmarks;
