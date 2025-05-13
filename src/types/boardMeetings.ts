
export interface BoardMeeting {
  id: string;
  title: string;
  content?: string;
  meeting_date: string;
  location?: string;
  created_at: string;
  updated_at?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  user_id?: string;
}

export interface BoardMeetingFile {
  id: string;
  board_meeting_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  created_at: string;
}
