export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  credits: number;
  created_at: string;
  last_activity: string;
}

export interface OtpRecord {
  email: string;
  otp_hash: string;
  expires_at: number;
  attempts: number;
  created_at: string;
}

export interface PaymentRequest {
  id: number;
  user_id: number;
  user_email: string;
  amount: number;
  utr: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: number;
  user_id: number;
  user_email: string;
  type: 'payment_approved' | 'admin_add' | 'admin_remove' | 'tool_usage' | 'code_redeem' | 'refund';
  amount: number;
  description: string;
  reference_id?: string;
  created_at: string;
}

export interface RedeemCode {
  id: number;
  code: string;
  code_hash: string;
  credits: number;
  used_by_user_id?: number;
  used_by_email?: string;
  used_at?: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  admin_email: string;
  action: string;
  details: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  pending_payments: number;
  approved_payments: number;
  total_credits_issued: number;
  today_payment_requests: number;
}

export interface ToolResult {
  success: boolean;
  message: string;
  credits_left: number;
  data?: Record<string, any>;
}
