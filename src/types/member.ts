export interface Member {
  id: string;
  name: string | null;
  email: string | null;
  department: string | null;
  role: string | null;
  phone?: string | null;
  image?: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
}

// Add UserPost interface at the module level for reuse
export interface UserPost {
  id: string;
  content: string;
  created_at: string;
  author_name: string | null;
  user_id: string;
}
