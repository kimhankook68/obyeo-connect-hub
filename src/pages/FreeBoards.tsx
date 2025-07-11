import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FreeBoards = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const postsPerPage = 10;
  const navigate = useNavigate();
  const { toast } = useToast();

  // New post dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("기타");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user role from profiles
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
          
        if (profileData) {
          setUserRole(profileData.role);
        }
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // First get total count
      const { count, error: countError } = await supabase
        .from("free_posts")
        .select("*", { count: "exact", head: true });
      
      if (countError) throw countError;
      
      // Calculate total pages
      const calculatedTotalPages = Math.ceil((count || 0) / postsPerPage);
      setTotalPages(calculatedTotalPages || 1);
      
      // Fetch paginated posts - modified query to avoid relationship error
      const from = (currentPage - 1) * postsPerPage;
      const to = from + postsPerPage - 1;
      
      // First get posts
      const { data: postsData, error: postsError } = await supabase
        .from("free_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (postsError) throw postsError;
      
      // Get author profiles separately and comment counts
      const postsWithDetails = await Promise.all((postsData || []).map(async (post) => {
        // Get author name
        let authorName = post.author.split('@')[0];
        if (post.user_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", post.user_id)
            .single();
            
          if (profileData?.name) {
            authorName = profileData.name;
          }
        }

        // Get comment count
        const { count: commentCount, error: commentError } = await supabase
          .from("free_post_comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);
        
        if (commentError) {
          console.error("Failed to get comment count:", commentError);
        }
        
        return { 
          ...post, 
          authorName,
          commentCount: commentCount || 0
        };
      }));
      
      setPosts(postsWithDetails || []);
    } catch (error) {
      console.error("게시물 가져오기 실패:", error);
      toast({
        title: "게시물 로드 실패",
        description: "게시물 목록을 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "게시물을 작성하려면 로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "입력 필요",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from("free_posts")
        .insert([
          {
            title: newPostTitle,
            content: newPostContent,
            author: user.email,
            user_id: user.id,
            views: 0,
            category: newPostCategory
          }
        ])
        .select();

      if (error) throw error;
      
      toast({
        title: "게시물 작성 성공",
        description: "게시물이 성공적으로 작성되었습니다.",
      });
      
      // Reset form and close dialog
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory("기타");
      setIsDialogOpen(false);
      
      // Refresh posts list
      fetchPosts();
    } catch (error: any) {
      console.error("게시물 작성 실패:", error);
      toast({
        title: "게시물 작성 실패",
        description: "게시물 작성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Add first page if not included
    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => handlePageChange(1)} isActive={currentPage === 1}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add last page if not included
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => handlePageChange(totalPages)} isActive={currentPage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
      .replace(/\.\s/g, '-').replace('.', '');
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    
    let badgeClass = "";
    
    switch (category) {
      case "질문":
        badgeClass = "bg-blue-100 text-blue-800";
        break;
      case "칭찬":
        badgeClass = "bg-green-100 text-green-800";
        break;
      case "건의":
        badgeClass = "bg-orange-100 text-orange-800";
        break;
      case "요청":
        badgeClass = "bg-purple-100 text-purple-800";
        break;
      default:
        badgeClass = "bg-gray-100 text-gray-800";
    }
    
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded-sm ${badgeClass}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="자유게시판" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">자유게시판</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  새 글 작성
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>새 게시물 작성</DialogTitle>
                  <DialogDescription>
                    자유게시판에 새 글을 작성합니다. 제목과 내용을 입력해주세요.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitNewPost} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      제목
                    </label>
                    <Input
                      id="title"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="게시물 제목을 입력하세요"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      분류
                    </label>
                    <Select 
                      value={newPostCategory} 
                      onValueChange={setNewPostCategory}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="분류를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="질문">질문</SelectItem>
                        <SelectItem value="칭찬">칭찬</SelectItem>
                        <SelectItem value="건의">건의</SelectItem>
                        <SelectItem value="요청">요청</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium">
                      내용
                    </label>
                    <Textarea
                      id="content"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="게시물 내용을 입력하세요"
                      className="min-h-[200px]"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      취소
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                          저장 중...
                        </>
                      ) : (
                        "저장"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">아직 게시물이 없습니다.</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    새 글 작성하기
                  </Button>
                </div>
              ) : (
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px] text-center">번호</TableHead>
                        <TableHead className="w-[100px] text-center">분류</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead className="w-[120px] text-center">작성자</TableHead>
                        <TableHead className="w-[120px] text-center">등록일</TableHead>
                        <TableHead className="w-[80px] text-center">조회수</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post, index) => (
                        <TableRow 
                          key={post.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/freeboards/${post.id}`)}
                        >
                          <TableCell className="text-center">
                            {(currentPage - 1) * postsPerPage + index + 1}
                          </TableCell>
                          <TableCell className="text-center">
                            {post.category ? getCategoryBadge(post.category) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {post.title}
                              {(new Date().getTime() - new Date(post.created_at).getTime()) < 86400000 && (
                                <Badge variant="secondary" className="ml-1 bg-red-500 text-white text-xs h-4 w-4 rounded-full p-0 flex items-center justify-center">
                                  N
                                </Badge>
                              )}
                              {post.commentCount > 0 && (
                                <Badge variant="secondary" className="ml-2 flex items-center gap-1 bg-purple-100 text-purple-800">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>{post.commentCount}</span>
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {post.authorName}
                          </TableCell>
                          <TableCell className="text-center">{formatDate(post.created_at)}</TableCell>
                          <TableCell className="text-center">{post.views || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {renderPaginationItems()}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default FreeBoards;
