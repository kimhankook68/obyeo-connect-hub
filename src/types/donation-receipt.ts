
export interface DonationReceipt {
  id: string;
  title: string;
  content: string;
  user_id: string;
  author: string;
  created_at: string;
  updated_at: string;
  processed: boolean;
  amount: number;
  receipt_file?: string;
}

export interface DonationReceiptComment {
  id: string;
  receipt_id: string;
  user_id: string;
  author: string;
  content: string;
  created_at: string;
  updated_at: string;
  attachment_url?: string;
}
