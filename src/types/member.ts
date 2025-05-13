
export interface Member {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  phone?: string | null;
  image?: string | null;
  created_at: string;
  user_id?: string | null;
}
