
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardCard } from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { MessageSquare, Heart, Edit, Trash2, MoreHorizontal, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserPost } from "@/types/member";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface PostWithDetails extends UserPost {
  likes: PostLike[];
  comments: PostComment[];
  isLiked?: boolean;
  showComments?: boolean;
}

const NewsFeed = ({ limit = 5, showViewMoreButton = true }: { limit?: number, showViewMoreButton?: boolean }) => {
  const [userPosts, setUserPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  // New state for comments
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Get current user and role
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      if (user) {
        // Get user role and name
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role, name")
          .eq("id", user.id)
          .single();
          
        if (profileData) {
          setUserRole(profileData.role || null);
          setUserName(profileData.name || user.email?.split('@')[0] || "사용자");
        }
      }

      // Fetch user posts
      try {
        // Cast the raw response to any first to bypass type checking
        const response: any = await supabase
          .from("user_posts" as any)
          .select("id, content, created_at, user_id, author_name")
          .order("created_at", { ascending: false })
          .limit(limit);
        
        // Check if response has data and no error
        if (response && response.data && !response.error) {
          // Map each item in the array to ensure it has the right structure
          const posts = response.data.map((post: any) => ({
            id: post.id,
            content: post.content,
            created_at: post.created_at,
            author_name: post.author_name,
            user_id: post.user_id,
            likes: [],
            comments: [],
            showComments: false
          }));

          // Get likes for each post
          if (posts.length > 0) {
            const postIds = posts.map((post: PostWithDetails) => post.id);
            
            // Fetch likes
            const { data: likesData } = await supabase
              .from("post_likes")
              .select("*")
              .in("post_id", postIds);

            // Fetch comments
            const { data: commentsData } = await supabase
              .from("post_comments")
              .select("*")
              .in("post_id", postIds)
              .order("created_at", { ascending: true });

            // Add likes and comments to posts
            if (likesData && commentsData) {
              const updatedPosts = posts.map((post: PostWithDetails) => {
                const postLikes = likesData.filter(like => like.post_id === post.id);
                const postComments = commentsData.filter(comment => comment.post_id === post.id);
                const isLiked = user ? postLikes.some(like => like.user_id === user.id) : false;
                
                return {
                  ...post,
                  likes: postLikes,
                  comments: postComments,
                  isLiked
                };
              });
              
              setUserPosts(updatedPosts);
            } else {
              setUserPosts(posts);
            }
          } else {
            setUserPosts(posts);
          }
        } else if (response.error) {
          console.error("Error fetching user posts:", response.error);
        }
      } catch (postFetchError) {
        console.error("Error processing user posts:", postFetchError);
      }
    } catch (error) {
      console.error("Error fetching news feed data:", error);
      toast({
        title: "데이터 불러오기 오류",
        description: "뉴스피드 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    
    // Set up real-time listeners for likes and comments
    const likesChannel = supabase
      .channel('post_likes_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        () => {
          fetchPosts();
        }
      )
      .subscribe();
      
    const commentsChannel = supabase
      .channel('post_comments_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_comments' },
        () => {
          fetchPosts();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [limit]);

  // Format date to relative time (e.g., "3 days ago")
  const formatRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: ko,
      });
    } catch (error) {
      return "날짜 오류";
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;

    setPostLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "포스트를 작성하려면 로그인이 필요합니다.",
          variant: "destructive",
        });
        setPostLoading(false);
        return;
      }

      // Get user profile info for name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      const authorName = profileData?.name || user.email?.split('@')[0] || "사용자";

      // Insert new post with better error handling
      const response: any = await supabase
        .from("user_posts" as any)
        .insert({
          content: newPost,
          user_id: user.id,
          author_name: authorName
        });

      if (response.error) throw response.error;

      // Clear input field
      setNewPost("");
      
      // Refresh news feed
      fetchPosts();
      
      toast({
        title: "작성 완료",
        description: "새 포스트가 작성되었습니다.",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "포스트 작성 오류",
        description: "포스트를 작성하는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setPostLoading(false);
    }
  };
  
  const handleEditPost = (post: PostWithDetails) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };
  
  const canModifyPost = (post: PostWithDetails) => {
    return userId === post.user_id || userRole === 'admin';
  };
  
  const handleUpdatePost = async () => {
    if (!editingPost || !editContent.trim()) return;
    
    try {
      const { error } = await supabase
        .from("user_posts" as any)
        .update({ content: editContent })
        .eq("id", editingPost);
        
      if (error) throw error;
      
      toast({
        title: "수정 완료",
        description: "포스트가 수정되었습니다.",
      });
      
      setEditingPost(null);
      setEditContent("");
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "수정 오류",
        description: "포스트 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };
  
  const confirmDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      const { error } = await supabase
        .from("user_posts" as any)
        .delete()
        .eq("id", postToDelete);
        
      if (error) throw error;
      
      toast({
        title: "삭제 완료",
        description: "포스트가 삭제되었습니다.",
      });
      
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "삭제 오류",
        description: "포스트 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // Toggle like
  const handleToggleLike = async (post: PostWithDetails) => {
    if (!userId) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 추가하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (post.isLiked) {
        // Find the like to remove
        const likeToRemove = post.likes.find(like => like.user_id === userId);
        
        if (likeToRemove) {
          const { error } = await supabase
            .from("post_likes")
            .delete()
            .eq("id", likeToRemove.id);
            
          if (error) throw error;
        }
      } else {
        // Add new like
        const { error } = await supabase
          .from("post_likes")
          .insert({
            post_id: post.id,
            user_id: userId
          });
          
        if (error) throw error;
      }
      
      // Update local state
      const updatedPosts = userPosts.map(p => {
        if (p.id === post.id) {
          if (post.isLiked) {
            return {
              ...p,
              likes: p.likes.filter(like => like.user_id !== userId),
              isLiked: false
            };
          } else {
            return {
              ...p,
              likes: [...p.likes, { id: 'temp', post_id: p.id, user_id: userId!, created_at: new Date().toISOString() }],
              isLiked: true
            };
          }
        }
        return p;
      });
      
      setUserPosts(updatedPosts);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "좋아요 오류",
        description: "좋아요 작업을 처리하는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // Toggle comments view
  const toggleComments = (postId: string) => {
    const updatedPosts = userPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          showComments: !post.showComments
        };
      }
      return post;
    });
    
    setUserPosts(updatedPosts);
  };

  // Add new comment
  const handleAddComment = async (postId: string) => {
    const commentContent = newComments[postId];
    if (!commentContent?.trim() || !userId) return;
    
    setCommentLoading({...commentLoading, [postId]: true});
    
    try {
      // Get current user name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userId)
        .single();
        
      const authorName = profileData?.name || userName || "사용자";
      
      const { error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: userId,
          author_name: authorName,
          content: commentContent
        });
        
      if (error) throw error;
      
      // Clear input field
      setNewComments({...newComments, [postId]: ""});
      
      toast({
        title: "댓글 작성 완료",
        description: "새 댓글이 작성되었습니다.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "댓글 작성 오류",
        description: "댓글을 작성하는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setCommentLoading({...commentLoading, [postId]: false});
    }
  };
  
  // Edit comment
  const handleEditComment = (comment: PostComment) => {
    setEditingComment(comment.id);
    setEditCommentContent(comment.content);
  };
  
  const canModifyComment = (comment: PostComment) => {
    return userId === comment.user_id || userRole === 'admin';
  };
  
  const handleUpdateComment = async () => {
    if (!editingComment || !editCommentContent.trim()) return;
    
    try {
      const { error } = await supabase
        .from("post_comments")
        .update({ content: editCommentContent, updated_at: new Date().toISOString() })
        .eq("id", editingComment);
        
      if (error) throw error;
      
      toast({
        title: "댓글 수정 완료",
        description: "댓글이 수정되었습니다.",
      });
      
      setEditingComment(null);
      setEditCommentContent("");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "댓글 수정 오류",
        description: "댓글 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };
  
  // Delete comment
  const confirmDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteCommentDialogOpen(true);
  };
  
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", commentToDelete);
        
      if (error) throw error;
      
      toast({
        title: "댓글 삭제 완료",
        description: "댓글이 삭제되었습니다.",
      });
      
      setDeleteCommentDialogOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "댓글 삭제 오류",
        description: "댓글 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleViewMore = () => {
    navigate("/newsfeed");
  };

  return (
    <DashboardCard 
      title="뉴스피드" 
      action={showViewMoreButton ? (
        <Button variant="ghost" size="sm" onClick={handleViewMore}>더보기</Button>
      ) : undefined}
      className="col-span-full"
    >
      {/* Post create section */}
      <div className="mb-6 flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{userName?.substring(0, 2) || "사용자"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea 
            placeholder="동료들에게 새로운 소식을 전해보세요."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="resize-none"
            maxLength={300}
          />
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">
              {newPost.length}/300자
            </span>
            <Button 
              size="sm" 
              disabled={!newPost.trim() || postLoading}
              onClick={handlePostSubmit}
            >
              {postLoading ? "작성 중..." : "작성하기"}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : userPosts.length > 0 ? (
        <div className="space-y-6">
          {userPosts.map((post) => (
            <div key={post.id} className="flex gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={undefined} />
                <AvatarFallback>
                  {post.author_name?.substring(0, 2) || "사용자"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{post.author_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(post.created_at)}
                    </span>
                  </div>
                  
                  {canModifyPost(post) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPost(post)}>
                          <Edit className="mr-2 h-4 w-4" /> 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDeletePost(post.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                {editingPost === post.id ? (
                  <div className="space-y-2">
                    <Textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="resize-none"
                      maxLength={300}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingPost(null);
                          setEditContent("");
                        }}
                      >
                        취소
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleUpdatePost}
                      >
                        저장
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-4 pt-1">
                  <button 
                    className={`flex items-center gap-1 text-xs ${post.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                    onClick={() => handleToggleLike(post)}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-red-500' : ''}`} /> {post.likes.length}
                  </button>
                  <button 
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageSquare className="h-4 w-4" /> {post.comments.length}
                  </button>
                </div>
                
                {/* Comments section */}
                {post.showComments && (
                  <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                    {post.comments.length > 0 && (
                      <div className="space-y-3">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="flex items-start gap-2 bg-gray-50 p-2 rounded-md">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{comment.author_name?.substring(0, 2) || "익명"}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  <span className="text-xs font-medium">{comment.author_name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {formatRelativeTime(comment.created_at)}
                                  </span>
                                </div>
                                
                                {canModifyComment(comment) && (
                                  <div className="flex">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleEditComment(comment)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0 text-red-500"
                                      onClick={() => confirmDeleteComment(comment.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              {editingComment === comment.id ? (
                                <div className="space-y-2">
                                  <Textarea 
                                    value={editCommentContent}
                                    onChange={(e) => setEditCommentContent(e.target.value)}
                                    className="resize-none text-xs min-h-[40px]"
                                    maxLength={200}
                                  />
                                  <div className="flex justify-end gap-1">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-6 text-xs"
                                      onClick={() => {
                                        setEditingComment(null);
                                        setEditCommentContent("");
                                      }}
                                    >
                                      취소
                                    </Button>
                                    <Button 
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={handleUpdateComment}
                                    >
                                      저장
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs">
                                  {comment.content}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* New comment form */}
                    <div className="flex items-start gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{userName?.substring(0, 2) || "사용자"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea 
                          placeholder="댓글을 작성하세요..."
                          value={newComments[post.id] || ""}
                          onChange={(e) => setNewComments({...newComments, [post.id]: e.target.value})}
                          className="resize-none min-h-[40px] text-xs"
                          maxLength={200}
                        />
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">
                            {(newComments[post.id]?.length || 0)}/200자
                          </span>
                          <Button 
                            size="sm" 
                            className="h-7 text-xs"
                            disabled={!newComments[post.id]?.trim() || commentLoading[post.id]}
                            onClick={() => handleAddComment(post.id)}
                          >
                            {commentLoading[post.id] ? "작성 중..." : "댓글 작성"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p>새로운 소식이 없습니다</p>
        </div>
      )}
      
      {/* Delete post confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>포스트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말 이 포스트를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete comment confirmation dialog */}
      <AlertDialog open={deleteCommentDialogOpen} onOpenChange={setDeleteCommentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말 이 댓글을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardCard>
  );
};

export default NewsFeed;
