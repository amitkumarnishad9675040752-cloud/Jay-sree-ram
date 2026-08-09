import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, OtpRecord, PaymentRequest, CreditTransaction, RedeemCode, ActivityLog, AdminStats } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'bindstore.json');

interface Schema {
  users: User[];
  passwords: Record<string, string>; // user_id -> password_hash
  otp_requests: OtpRecord[];
  payment_requests: PaymentRequest[];
  credit_transactions: CreditTransaction[];
  codes: RedeemCode[];
  activity_logs: ActivityLog[];
  counters: {
    user_id: number;
    payment_id: number;
    transaction_id: number;
    code_id: number;
    log_id: number;
  };
}

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'akffking956908@gmail.com';
const DEFAULT_ADMIN_PASS = 'admin@199';

class Database {
  private data: Schema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to load database, initializing new structure:', err);
        this.data = this.initSchema();
      }
    } else {
      this.data = this.initSchema();
      this.save();
    }
    this.ensureAdminUser();
  }

  private initSchema(): Schema {
    return {
      users: [],
      passwords: {},
      otp_requests: [],
      payment_requests: [],
      credit_transactions: [],
      codes: [],
      activity_logs: [],
      counters: {
        user_id: 1000,
        payment_id: 50,
        transaction_id: 100,
        code_id: 10,
        log_id: 1
      }
    };
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  private ensureAdminUser() {
    let admin = this.data.users.find(u => u.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase());
    if (!admin) {
      this.data.counters.user_id += 1;
      const adminId = this.data.counters.user_id;
      admin = {
        id: adminId,
        email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
        role: 'admin',
        status: 'active',
        credits: 999999,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      };
      this.data.users.push(admin);

      // Use env ADMIN_PASSWORD_HASH if supplied, else hash default admin@199
      let passHash = process.env.ADMIN_PASSWORD_HASH;
      if (!passHash || passHash.trim() === '') {
        passHash = bcrypt.hashSync(DEFAULT_ADMIN_PASS, 10);
      }
      this.data.passwords[adminId] = passHash;
      this.save();
      console.log(`[DB] Created Admin user: ${admin.email} (ID: ${adminId})`);
    } else {
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        this.save();
      }
    }
  }

  // --- USER AUTH & MANAGEMENT ---

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: number): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public verifyPassword(userId: number, pass: string): boolean {
    const storedHash = this.data.passwords[userId];
    if (!storedHash) return false;
    // Check if storedHash is a bcrypt hash or plaintext/sha256 fallback
    if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
      return bcrypt.compareSync(pass, storedHash);
    }
    return storedHash === pass || storedHash === crypto.createHash('sha256').update(pass).digest('hex');
  }

  public updateLastActivity(userId: number) {
    const user = this.getUserById(userId);
    if (user) {
      user.last_activity = new Date().toISOString();
      this.save();
    }
  }

  public createUser(email: string, passwordHash: string): User {
    this.data.counters.user_id += 1;
    const newId = this.data.counters.user_id;
    const freeCredits = parseInt(process.env.FREE_CREDITS || '0', 10);
    const user: User = {
      id: newId,
      email: email.toLowerCase(),
      role: email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
      status: 'active',
      credits: freeCredits,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };
    this.data.users.push(user);
    this.data.passwords[newId] = passwordHash;
    this.save();

    this.logActivity(email, 'USER_REGISTERED', `New account created with ID ${newId}`);
    return user;
  }

  // --- OTP MANAGEMENT ---

  public saveOtp(email: string, otp: string, expirySeconds: number = 300) {
    const emailLower = email.toLowerCase();
    const otpHash = bcrypt.hashSync(otp, 8);
    const expiresAt = Date.now() + expirySeconds * 1000;

    // Remove existing OTP for this email
    this.data.otp_requests = this.data.otp_requests.filter(o => o.email !== emailLower);
    this.data.otp_requests.push({
      email: emailLower,
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0,
      created_at: new Date().toISOString()
    });
    this.save();
  }

  public verifyOtp(email: string, otp: string): { valid: boolean; reason?: string } {
    const emailLower = email.toLowerCase();
    const record = this.data.otp_requests.find(o => o.email === emailLower);
    if (!record) {
      return { valid: false, reason: 'OTP not requested or expired.' };
    }
    if (Date.now() > record.expires_at) {
      this.data.otp_requests = this.data.otp_requests.filter(o => o.email !== emailLower);
      this.save();
      return { valid: false, reason: 'OTP has expired. Please request a new one.' };
    }
    if (record.attempts >= 5) {
      return { valid: false, reason: 'Maximum OTP verification attempts reached. Please request a new OTP.' };
    }

    record.attempts += 1;
    const isMatch = bcrypt.compareSync(otp, record.otp_hash);
    if (!isMatch) {
      this.save();
      return { valid: false, reason: 'Invalid OTP entered.' };
    }

    // Success - consume OTP
    this.data.otp_requests = this.data.otp_requests.filter(o => o.email !== emailLower);
    this.save();
    return { valid: true };
  }

  // --- CREDIT MANAGEMENT ---

  public addCredits(userId: number, amount: number, type: CreditTransaction['type'], description: string, refId?: string, adminEmail?: string): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    user.credits += amount;
    this.data.counters.transaction_id += 1;
    const tx: CreditTransaction = {
      id: this.data.counters.transaction_id,
      user_id: user.id,
      user_email: user.email,
      type,
      amount,
      description,
      reference_id: refId,
      created_at: new Date().toISOString()
    };
    this.data.credit_transactions.push(tx);
    this.save();

    if (adminEmail) {
      this.logActivity(adminEmail, 'CREDITS_MODIFIED', `${amount > 0 ? 'Added' : 'Removed'} ${Math.abs(amount)} credits for user ${user.email} (ID: ${user.id}). Reason: ${description}`);
    }

    return user;
  }

  public deductCredit(userId: number, description: string): { success: boolean; creditsLeft: number; reason?: string } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, creditsLeft: 0, reason: 'User not found' };

    // Admin has unlimited credits behavior
    if (user.role === 'admin') {
      return { success: true, creditsLeft: user.credits };
    }

    if (user.credits < 1) {
      return { success: false, creditsLeft: user.credits, reason: 'Insufficient credits' };
    }

    user.credits -= 1;
    this.data.counters.transaction_id += 1;
    const tx: CreditTransaction = {
      id: this.data.counters.transaction_id,
      user_id: user.id,
      user_email: user.email,
      type: 'tool_usage',
      amount: -1,
      description,
      created_at: new Date().toISOString()
    };
    this.data.credit_transactions.push(tx);
    this.save();

    return { success: true, creditsLeft: user.credits };
  }

  public refundCredit(userId: number, description: string) {
    const user = this.getUserById(userId);
    if (!user) return;

    if (user.role !== 'admin') {
      user.credits += 1;
      this.data.counters.transaction_id += 1;
      const tx: CreditTransaction = {
        id: this.data.counters.transaction_id,
        user_id: user.id,
        user_email: user.email,
        type: 'refund',
        amount: 1,
        description,
        created_at: new Date().toISOString()
      };
      this.data.credit_transactions.push(tx);
      this.save();
    }
  }

  // --- PAYMENTS & UTR ---

  public createPaymentRequest(userId: number, amount: number, utr: string): PaymentRequest {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    this.data.counters.payment_id += 1;
    const req: PaymentRequest = {
      id: this.data.counters.payment_id,
      user_id: user.id,
      user_email: user.email,
      amount,
      utr: utr.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.payment_requests.push(req);
    this.save();

    this.logActivity(user.email, 'PAYMENT_SUBMITTED', `Submitted payment UTR ${utr} for ₹${amount}`);
    return req;
  }

  public approvePayment(paymentId: number, adminEmail: string): { success: boolean; message: string } {
    const payReq = this.data.payment_requests.find(p => p.id === paymentId);
    if (!payReq) return { success: false, message: 'Payment request not found' };

    if (payReq.status === 'approved') {
      return { success: false, message: 'Payment already processed.' };
    }

    if (payReq.status === 'rejected') {
      return { success: false, message: 'Payment was previously rejected.' };
    }

    const user = this.getUserById(payReq.user_id);
    if (!user) return { success: false, message: 'Associated user not found' };

    // Calculate credits (₹99 = 1 credit)
    const pricePerCredit = parseInt(process.env.CREDIT_PRICE || '99', 10);
    const creditsToAdd = Math.max(1, Math.floor(payReq.amount / pricePerCredit));

    // Update payment request status
    payReq.status = 'approved';
    payReq.updated_at = new Date().toISOString();

    // Add credits to exact user account atomically
    this.addCredits(user.id, creditsToAdd, 'payment_approved', `Payment verified (UTR: ${payReq.utr})`, `PAY-${payReq.id}`, adminEmail);

    this.logActivity(adminEmail, 'PAYMENT_APPROVED', `Approved Payment #${payReq.id} for user ${user.email} (Added ${creditsToAdd} credits)`);
    this.save();

    return { success: true, message: `Approved payment #${payReq.id}. Added +${creditsToAdd} credit(s) to ${user.email}.` };
  }

  public rejectPayment(paymentId: number, adminEmail: string, note?: string): { success: boolean; message: string } {
    const payReq = this.data.payment_requests.find(p => p.id === paymentId);
    if (!payReq) return { success: false, message: 'Payment request not found' };

    if (payReq.status !== 'pending') {
      return { success: false, message: `Payment is already ${payReq.status}.` };
    }

    payReq.status = 'rejected';
    payReq.admin_note = note || 'Rejected by admin';
    payReq.updated_at = new Date().toISOString();

    this.logActivity(adminEmail, 'PAYMENT_REJECTED', `Rejected Payment #${payReq.id} (UTR: ${payReq.utr}). Note: ${payReq.admin_note}`);
    this.save();

    return { success: true, message: `Payment #${payReq.id} rejected.` };
  }

  // --- REDEEM CODES ---

  public createRedeemCode(credits: number, adminEmail: string): RedeemCode {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const rand = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const chkIndex = (credits * 7 + rand.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % chars.length;
    const code = `BS-${credits}-${rand}${chars[chkIndex]}`;

    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    this.data.counters.code_id += 1;
    const newCodeRecord: RedeemCode = {
      id: this.data.counters.code_id,
      code,
      code_hash: codeHash,
      credits,
      created_at: new Date().toISOString()
    };

    this.data.codes.push(newCodeRecord);
    this.save();

    this.logActivity(adminEmail, 'CODE_GENERATED', `Generated ${credits} credit code: ${code}`);
    return newCodeRecord;
  }

  public redeemCode(userId: number, inputCode: string): { success: boolean; creditsAdded: number; message: string } {
    const cleanCode = inputCode.trim().toUpperCase();
    const codeHash = crypto.createHash('sha256').update(cleanCode).digest('hex');

    const record = this.data.codes.find(c => c.code_hash === codeHash || c.code.toUpperCase() === cleanCode);
    if (!record) {
      return { success: false, creditsAdded: 0, message: 'Invalid redeem code entered.' };
    }

    if (record.used_by_user_id) {
      return { success: false, creditsAdded: 0, message: 'This redeem code has already been claimed.' };
    }

    const user = this.getUserById(userId);
    if (!user) return { success: false, creditsAdded: 0, message: 'User not found' };

    record.used_by_user_id = user.id;
    record.used_by_email = user.email;
    record.used_at = new Date().toISOString();

    this.addCredits(user.id, record.credits, 'code_redeem', `Redeemed code ${record.code}`, `CODE-${record.id}`);
    this.save();

    return { success: true, creditsAdded: record.credits, message: `Successfully redeemed ${record.credits} credits!` };
  }

  // --- USER STATUS (SUSPEND / ACTIVATE) ---

  public setUserStatus(userId: number, status: 'active' | 'suspended', adminEmail: string) {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    user.status = status;
    this.save();

    this.logActivity(adminEmail, 'USER_STATUS_CHANGED', `Changed status for ${user.email} (ID: ${user.id}) to ${status}`);
  }

  // --- ADMIN STATS & LOGS ---

  public getAdminStats(): AdminStats {
    const total_users = this.data.users.filter(u => u.role !== 'admin').length;
    const pending_payments = this.data.payment_requests.filter(p => p.status === 'pending').length;
    const approved_payments = this.data.payment_requests.filter(p => p.status === 'approved').length;

    let total_credits_issued = 0;
    this.data.credit_transactions.forEach(tx => {
      if (tx.amount > 0) total_credits_issued += tx.amount;
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const today_payment_requests = this.data.payment_requests.filter(p => p.created_at.startsWith(todayStr)).length;

    return {
      total_users,
      pending_payments,
      approved_payments,
      total_credits_issued,
      today_payment_requests
    };
  }

  public getAllUsers(): User[] {
    return this.data.users.map(u => ({ ...u }));
  }

  public getAllPayments(): PaymentRequest[] {
    return [...this.data.payment_requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getUserPaymentRequests(userId: number): PaymentRequest[] {
    return this.data.payment_requests
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllTransactions(): CreditTransaction[] {
    return [...this.data.credit_transactions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getUserTransactions(userId: number): CreditTransaction[] {
    return this.data.credit_transactions
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllCodes(): RedeemCode[] {
    return [...this.data.codes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getActivityLogs(): ActivityLog[] {
    return [...this.data.activity_logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public logActivity(adminEmail: string, action: string, details: string) {
    this.data.counters.log_id += 1;
    const log: ActivityLog = {
      id: this.data.counters.log_id,
      admin_email: adminEmail,
      action,
      details,
      created_at: new Date().toISOString()
    };
    this.data.activity_logs.push(log);
    this.save();
  }
}

export const db = new Database();
