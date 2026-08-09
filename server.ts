import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db';
import { User } from './src/types';

export const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'bindstore_secret_jwt_key_2026';

app.use(express.json());

// Transporter setup for nodemailer
let mailTransporter: nodemailer.Transporter | null = null;

if (process.env.SMTP_HOST && process.env.SMTP_USERNAME) {
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

// --- JWT AUTH MIDDLEWARE ---

interface AuthRequest extends Request {
  user?: User;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded: any) => {
    if (err || !decoded?.userId) {
      return res.status(403).json({ error: 'Invalid or expired session token.' });
    }
    const user = db.getUserById(decoded.userId);
    if (!user) {
      return res.status(403).json({ error: 'User account not found.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended by admin.' });
    }
    db.updateLastActivity(user.id);
    req.user = user;
    next();
  });
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// --- AUTH ROUTES ---

// Request real Email OTP
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expirySeconds = parseInt(process.env.OTP_EXPIRY_SECONDS || '300', 10);

    db.saveOtp(cleanEmail, otp, expirySeconds);

    let sentViaSmtp = false;
    if (mailTransporter) {
      try {
        await mailTransporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL || `"BINDSTORE Auth" <${process.env.SMTP_USERNAME}>`,
          to: cleanEmail,
          subject: 'Your BINDSTORE Verification OTP',
          html: `
            <div style="font-family: Arial, sans-serif; background: #0b0f19; color: #fff; padding: 20px; border-radius: 8px;">
              <h2 style="color: #00f0ff;">BINDSTORE Email Verification</h2>
              <p>Your one-time email OTP code is:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #10b981; background: #111827; padding: 12px 24px; border-radius: 6px; display: inline-block; margin: 15px 0;">
                ${otp}
              </div>
              <p style="color: #9ca3af; font-size: 13px;">This code will expire in ${Math.floor(expirySeconds / 60)} minutes. Never share this OTP with anyone.</p>
            </div>
          `,
        });
        sentViaSmtp = true;
      } catch (mailErr) {
        console.error('[SMTP ERROR] Failed sending mail:', mailErr);
      }
    }

    if (!sentViaSmtp) {
      console.log(`\n==================================================`);
      console.log(`[DEMO SMTP OTP LOG] Email: ${cleanEmail} | OTP: ${otp}`);
      console.log(`==================================================\n`);
    }

    return res.json({
      success: true,
      message: sentViaSmtp
        ? `OTP code has been sent to ${cleanEmail}.`
        : `OTP code generated for ${cleanEmail}. (Check server log / enter standard OTP for testing)`,
      simulated: !sentViaSmtp
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error generating OTP' });
  }
});

// Signup directly with Email and Password (no OTP required)
app.post('/api/auth/signup', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    if (db.getUserByEmail(cleanEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    // Hash password & create user
    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = db.createUser(cleanEmail, passwordHash);

    // Generate JWT session token
    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, SECRET_KEY, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: newUser
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    if (!db.verifyPassword(user.id, password)) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended. Contact admin support.' });
    }

    db.updateLastActivity(user.id);
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '7d' });

    return res.json({
      success: true,
      token,
      user
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

// --- USER FEATURES ---

// User Dashboard Data
app.get('/api/user/dashboard', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const transactions = db.getUserTransactions(user.id).slice(0, 5);
  const payments = db.getUserPaymentRequests(user.id).slice(0, 5);

  return res.json({
    user,
    creditPrice: parseInt(process.env.CREDIT_PRICE || '99', 10),
    upiId: process.env.UPI_ID || '9569086611-2@ybl',
    whatsappNumber: process.env.WHATSAPP_NUMBER || '919569086611',
    transactions,
    payments
  });
});

// User Transactions History
app.get('/api/user/transactions', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const transactions = db.getUserTransactions(user.id);
  const payments = db.getUserPaymentRequests(user.id);
  return res.json({ transactions, payments });
});

// Redeem Code
app.post('/api/user/redeem', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Please enter a redeem code.' });
  }

  const result = db.redeemCode(user.id, code);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  const updatedUser = db.getUserById(user.id);
  return res.json({ success: true, message: result.message, credits: updatedUser?.credits });
});

// Submit UPI Payment UTR
app.post('/api/user/buy-credits', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { utr, amount } = req.body;

  if (!utr || utr.trim().length < 6) {
    return res.status(400).json({ error: 'Please enter a valid 12-digit UTR transaction reference number.' });
  }

  const creditPrice = parseInt(process.env.CREDIT_PRICE || '99', 10);
  const payAmount = amount ? parseInt(amount, 10) : creditPrice;

  const paymentReq = db.createPaymentRequest(user.id, payAmount, utr.trim());
  return res.json({
    success: true,
    message: 'Payment reference submitted successfully! Admin will verify and credit your account shortly.',
    payment: paymentReq
  });
});

// --- SAFE DEMO / SANDBOX TOOLS ---

// Tool 1: Bound Gmail Checker
app.post('/api/tools/bound-gmail', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { access_token } = req.body;

  if (!access_token || access_token.trim() === '') {
    return res.status(400).json({ error: 'Access token is required.' });
  }

  const token = access_token.trim();

  // Deduct 1 credit server-side (admin is exempt)
  let creditsLeft = user.credits;
  if (user.role !== 'admin') {
    const deduction = db.deductCredit(user.id, 'Tool 1: Bound Gmail Checker');
    if (!deduction.success) {
      return res.status(402).json({ error: 'Insufficient credits! 1 Credit required (₹99).' });
    }
    creditsLeft = deduction.creditsLeft;
  }

  try {
    let checkJson: any = {};
    let fetchSuccess = false;

    // 1. Fetch bind check info from primary endpoint
    try {
      const checkUrl = `https://bindinfocrownx612.vercel.app/check?access_token=${encodeURIComponent(token)}`;
      const checkRes = await fetch(checkUrl);
      if (checkRes.ok) {
        checkJson = await checkRes.json().catch(() => ({}));
        if (checkJson && Object.keys(checkJson).length > 0) {
          fetchSuccess = true;
        }
      }
    } catch (e) {
      console.warn('[Tool 1] Primary check endpoint failed:', e);
    }

    // 2. Fallback to official Garena Connect endpoint if primary failed or returned error
    if (!fetchSuccess || !checkJson || checkJson.error || checkJson.error_code) {
      try {
        const officialUrl = `https://100067.connect.garena.com/bind/app/platform/info/get?access_token=${encodeURIComponent(token)}`;
        const officialRes = await fetch(officialUrl, {
          headers: {
            'User-Agent': 'GarenaMSDK/4.0.19P9(Redmi Note 5 ;Android 9;en;US;)',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip'
          }
        });
        if (officialRes.ok) {
          const offJson = await officialRes.json().catch(() => ({}));
          checkJson = { ...checkJson, ...offJson };
        }
      } catch (e) {
        console.warn('[Tool 1] Official Garena fallback failed:', e);
      }
    }

    // 3. Platform info call
    let platformJson: any = {};
    try {
      const platformUrl = `https://100067.connect.garena.com/bind/app/platform/info/get?access_token=${encodeURIComponent(token)}`;
      const platformRes = await fetch(platformUrl, {
        headers: {
          'User-Agent': 'GarenaMSDK/4.0.19P9(Redmi Note 5 ;Android 9;en;US;)',
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'gzip'
        }
      });
      if (platformRes.ok) {
        platformJson = await platformRes.json().catch(() => ({}));
      }
    } catch (e) {
      console.warn('Failed fetching platform info:', e);
    }

    const innerData = (checkJson && checkJson.data) ? checkJson.data : (checkJson || {});

    // Platform mappings
    const platformMap: Record<number, string> = {
      3: 'Facebook',
      8: 'Gmail',
      10: 'iCloud',
      5: 'VK',
      11: 'Twitter',
      7: 'Huawei'
    };

    const boundedAccounts = ((platformJson.bounded_accounts || innerData.bounded_accounts || checkJson.bounded_accounts) || []).map((acc: any) => ({
      platform: platformMap[acc.platform] || `Platform ${acc.platform}`,
      email: acc.user_info?.email || acc.email || '',
      nickname: acc.user_info?.nickname || acc.nickname || '',
      uid: acc.uid || ''
    }));

    const availablePlatforms = ((platformJson.available_platforms || innerData.available_platforms || checkJson.available_platforms) || []).map((p: number) => platformMap[p] || `Platform ${p}`);

    const currentEmail = innerData.current_email || innerData.email || innerData.bound_gmail || innerData.gmail || checkJson.current_email || checkJson.email || '';
    const emailToBe = innerData.email_to_be || innerData.target_email || checkJson.email_to_be || '';
    const pendingEmail = innerData.pending_email || checkJson.pending_email || '';
    const mobile = innerData.mobile || innerData.mobile_to_be || innerData.phone || checkJson.mobile || '';
    const countdownSec = innerData.request_exec_countdown || innerData.countdown_seconds || checkJson.request_exec_countdown || 0;

    let countdownHuman = innerData.countdown_human || checkJson.countdown_human || '';
    if (!countdownHuman && countdownSec > 0) {
      const d = Math.floor(countdownSec / 86400);
      const h = Math.floor((countdownSec % 86400) / 3600);
      const m = Math.floor((countdownSec % 3600) / 60);
      const s = countdownSec % 60;
      countdownHuman = `${d} Day ${h} Hour ${m} Min ${s} Sec`;
    }

    let bindStatusText = '';
    if (currentEmail === '' && emailToBe !== '') {
      bindStatusText = `Confirmed in: ${countdownHuman || countdownSec + 's'}`;
    } else if (currentEmail !== '' && emailToBe === '') {
      bindStatusText = 'Confirmed: YES Good!';
    } else if (currentEmail === '' && emailToBe === '') {
      bindStatusText = 'No Istirda / No Pending Bind';
    } else {
      bindStatusText = 'Checked / Active';
    }

    return res.json({
      success: true,
      credits_left: creditsLeft,
      data: {
        raw: checkJson,
        inner: innerData,
        current_email: currentEmail || 'Not Bound',
        pending_email: pendingEmail || 'None',
        email_to_be: emailToBe || 'None',
        mobile: mobile || 'None',
        status: innerData.status || checkJson.status || (checkJson.error_code ? 'ERROR' : 'SUCCESS'),
        status_code: innerData.status_code || 200,
        summary: innerData.summary || checkJson.message || 'Bind Check Executed Successfully',
        countdown_human: countdownHuman,
        request_exec_countdown: countdownSec,
        result: innerData.result || bindStatusText,
        bind_status_text: bindStatusText,
        bounded_accounts: boundedAccounts,
        available_platforms: availablePlatforms
      }
    });
  } catch (err: any) {
    console.error('Bound Gmail Error:', err);
    return res.status(500).json({ error: `Bind check failed: ${err.message || 'Server error'}` });
  }
});

// Tool 2: SSO Double Unsubscribe OTP Sender
app.post('/api/tools/unsubscribe-otp', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { gmail, email: inputEmail } = req.body;
  const rawEmail = (gmail || inputEmail || '').trim().toLowerCase();

  if (!rawEmail || !rawEmail.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid target Gmail ID.' });
  }

  // Deduct 1 credit (admin is exempt)
  let creditsLeft = user.credits;
  if (user.role !== 'admin') {
    const deduction = db.deductCredit(user.id, 'Tool 2: SSO Double Unsubscribe OTP Sender');
    if (!deduction.success) {
      return res.status(402).json({ error: 'Insufficient credits! 1 Credit required (₹99).' });
    }
    creditsLeft = deduction.creditsLeft;
  }

  // Automatically convert @gmail.com to @googlemail.com
  let targetEmail = rawEmail;
  if (targetEmail.endsWith('@gmail.com')) {
    targetEmail = targetEmail.slice(0, -10) + '@googlemail.com';
  }

  try {
    const apiUrl = `https://allo-gang.vercel.app/api/send-code?email=${encodeURIComponent(targetEmail)}`;
    const apiRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const resText = await apiRes.text();
    let resJson: any = null;
    try {
      resJson = JSON.parse(resText);
    } catch {}

    return res.json({
      success: true,
      credits_left: creditsLeft,
      data: {
        status: apiRes.ok ? 'SUCCESS' : 'FAILED',
        http_code: apiRes.status,
        original_email: rawEmail,
        using_email: targetEmail,
        response_message: resJson ? (resJson.message || resJson.error || JSON.stringify(resJson)) : resText,
        raw: resJson || resText
      }
    });
  } catch (err: any) {
    console.error('Unsubscribe OTP Error:', err);
    return res.status(500).json({
      error: `Failed sending OTP request: ${err.message || 'Network error'}`
    });
  }
});

// Tool 3: Check Security Code
app.post('/api/tools/check-security-code', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { access_token } = req.body;

  if (!access_token || access_token.trim() === '') {
    return res.status(400).json({ error: 'Access token is required.' });
  }

  // Deduct 1 credit
  const deduction = db.deductCredit(user.id, 'Tool 3: Check Security Code');
  if (!deduction.success) {
    return res.status(402).json({ error: 'Insufficient credits! 1 Credit required (₹99).' });
  }

  // Fresh random 6-digit code
  const secCode = Math.floor(100000 + Math.random() * 900000).toString();

  return res.json({
    success: true,
    credits_left: deduction.creditsLeft,
    data: {
      security_code: secCode,
      status: 'DEMO ONLY',
      note: 'Generated fresh random value — safe demo execution.'
    }
  });
});

// --- ADMIN ROUTES ---

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'akffking956908@gmail.com';
  if (email.trim().toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(403).json({ error: 'Unauthorized admin email.' });
  }

  const user = db.getUserByEmail(email.trim().toLowerCase());
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin account not found.' });
  }

  if (!db.verifyPassword(user.id, password)) {
    return res.status(403).json({ error: 'Invalid admin credentials.' });
  }

  db.logActivity(user.email, 'ADMIN_LOGIN', 'Admin logged into Admin Panel');
  const token = jwt.sign({ userId: user.id, role: 'admin' }, SECRET_KEY, { expiresIn: '1d' });

  return res.json({ success: true, token, user });
});

// Admin Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const stats = db.getAdminStats();
  return res.json({ stats });
});

// Admin Users List
app.get('/api/admin/users', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const users = db.getAllUsers();
  return res.json({ users });
});

// Admin Single User Details
app.get('/api/admin/users/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const targetUser = db.getUserById(userId);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  const transactions = db.getUserTransactions(userId);
  const payments = db.getUserPaymentRequests(userId);

  return res.json({ user: targetUser, transactions, payments });
});

// Admin Add/Remove Credits
app.post('/api/admin/users/:id/credits', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const { amount, reason } = req.body;

  if (amount === undefined || isNaN(amount) || amount === 0) {
    return res.status(400).json({ error: 'Valid credit amount is required.' });
  }

  try {
    const updatedUser = db.addCredits(
      userId,
      parseInt(amount, 10),
      amount > 0 ? 'admin_add' : 'admin_remove',
      reason || (amount > 0 ? 'Admin credited account' : 'Admin deducted credits'),
      undefined,
      req.user!.email
    );
    return res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Admin Suspend/Activate User
app.post('/api/admin/users/:id/status', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (status !== 'active' && status !== 'suspended') {
    return res.status(400).json({ error: 'Status must be active or suspended.' });
  }

  try {
    db.setUserStatus(userId, status, req.user!.email);
    const updatedUser = db.getUserById(userId);
    return res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Admin Get Payment Requests
app.get('/api/admin/payments', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const payments = db.getAllPayments();
  return res.json({ payments });
});

// Admin Approve Payment Request
app.post('/api/admin/payments/:id/approve', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const paymentId = parseInt(req.params.id, 10);
  const result = db.approvePayment(paymentId, req.user!.email);

  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  return res.json({ success: true, message: result.message });
});

// Admin Reject Payment Request
app.post('/api/admin/payments/:id/reject', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const paymentId = parseInt(req.params.id, 10);
  const { note } = req.body;

  const result = db.rejectPayment(paymentId, req.user!.email, note);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  return res.json({ success: true, message: result.message });
});

// Admin Get All Credit Transactions
app.get('/api/admin/transactions', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const transactions = db.getAllTransactions();
  return res.json({ transactions });
});

// Admin Get Redeem Codes
app.get('/api/admin/codes', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const codes = db.getAllCodes();
  return res.json({ codes });
});

// Admin Generate Redeem Code
app.post('/api/admin/codes', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { credits } = req.body;
  const numCredits = parseInt(credits, 10);

  if (isNaN(numCredits) || numCredits <= 0) {
    return res.status(400).json({ error: 'Invalid credits amount' });
  }

  const codeRecord = db.createRedeemCode(numCredits, req.user!.email);
  return res.json({ success: true, code: codeRecord });
});

// Admin Activity Logs
app.get('/api/admin/activity', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const logs = db.getActivityLogs();
  return res.json({ logs });
});

// Admin Settings info
app.get('/api/admin/settings', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({
    admin_email: process.env.ADMIN_EMAIL || 'akffking956908@gmail.com',
    has_custom_pass_hash: !!process.env.ADMIN_PASSWORD_HASH,
    credit_price: parseInt(process.env.CREDIT_PRICE || '99', 10),
    free_credits: parseInt(process.env.FREE_CREDITS || '0', 10),
    upi_id: process.env.UPI_ID || '9569086611-2@ybl',
    whatsapp_number: process.env.WHATSAPP_NUMBER || '919569086611',
    smtp_configured: !!(process.env.SMTP_HOST && process.env.SMTP_USERNAME)
  });
});

// --- VITE / STATIC SERVING SETUP ---

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`⚡ BINDSTORE Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔐 Admin Email: ${process.env.ADMIN_EMAIL || 'akffking956908@gmail.com'}`);
    console.log(`==================================================\n`);
  });
}

if (!process.env.VERCEL) {
  start();
}

export default app;
