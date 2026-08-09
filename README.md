# BINDSTORE — Complete Web Application Setup Guide
## (Garena Bind Service — Hindi + English Guide)

BINDSTORE ek modern, mobile-first, dark gaming-style SaaS web application hai jisme Admin Panel, UPI Payment System (₹99 per credit), Real Email OTP Signup, Redeem Codes, aur 3 Safe Sandbox Tools shaamil hain.

---

## 📌 Features Overview
- **Mobile-First Android Responsive UI**: Target phone width 360px–430px, compact cards, easy touch navigation.
- **Admin System & Admin Login**: Secure Admin Panel (`/admin`) for `akffking956908@gmail.com`. Password stored via secure environment variable `ADMIN_PASSWORD_HASH`.
- **UPI Payment System**: User ₹99 pay karke UTR submit karta hai -> Admin UTR aur registered email verify karke **APPROVE** karta hai -> User ke account me exact +1 Credit add ho jata hai.
- **Real Email OTP Verification**: Real SMTP ke zariye 6-digit OTP code bhejta hai.
- **Safe Sandbox Tools**:
  1. **Bound Gmail Checker**: Safe demo processing output (no third-party query).
  2. **SSO Double Unsubscribe OTP**: Safe demo OTP generator (no third-party OTP sent).
  3. **Check Security Code**: Fresh random 6-digit demo code generator.

---

## 🚀 Quick Local Setup Commands (Node.js + Express + React)

### 1. Repository Clone & Dependency Install
```bash
# Dependencies install karein
npm install
```

### 2. Configure `.env` File
Root folder me `.env` file banayein aur configuration fill karein:
```env
SECRET_KEY="bindstore_super_secret_jwt_key_2026"

CREDIT_PRICE=99
FREE_CREDITS=0

UPI_ID="9569086611-2@ybl"
WHATSAPP_NUMBER=9195690866611

ADMIN_EMAIL="akffking956908@gmail.com"
# Generated Bcrypt hash for admin password:
ADMIN_PASSWORD_HASH="$2a$10$YourBcryptHashHere..."

# Real SMTP configuration (for Email OTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USERNAME="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM_EMAIL="BINDSTORE <your-email@gmail.com>"

OTP_EXPIRY_SECONDS=300
```

### 3. Generate Admin Password Hash
Plaintext password source code ya `.env` me **kabhi mat rakhein**. Below terminal command se Bcrypt hash generate karein:

```bash
# Node.js terminal command:
node -e "console.log(require('bcryptjs').hashSync('admin@199', 10))"
```
Output ko copy karke `.env` file me `ADMIN_PASSWORD_HASH=` me paste karein.

### 4. Run Application
```bash
# Development mode me app run karein
npm run dev
```
Application browser me http://localhost:3000 par launch ho jayegi.

---

## 📖 Complete Step-by-Step Usage Tutorial (Hindi Guide)

### Step 1: User Registration with Email OTP
1. Browser me open karein aur **Sign Up** par click karein.
2. Apna Email ID (`user@example.com`) aur Password enter karein.
3. **SEND OTP TO EMAIL** button dabayein.
4. Server aapke email par 6-digit OTP code bhejega.
5. Email se OTP code copy karke enter karein aur **VERIFY OTP & CREATE ACCOUNT** click karein.

### Step 2: Buying Credits (₹99 / Credit)
1. User **Buy Credits** tab par jata hai.
2. Dashboard par **UPI ID** (`9569086611-2@ybl`) aur **UPI QR Code** dikhayi dega.
3. GPay, PhonePe, ya Paytm se ₹99 pay karein.
4. Payment ka 12-digit **UTR / Transaction Reference Number** copy karein.
5. App me **UTR Number** enter karke **SUBMIT PAYMENT REFERENCE** dabayein.
6. Request ka status **PENDING** dikhayi dega.

### Step 3: Admin Approval Flow
1. Admin open karta hai: `/admin/login`
2. Admin Email (`akffking956908@gmail.com`) aur Password (`admin@199`) se Log In karta hai.
3. **Payment Requests** (`/admin/payments`) tab par jata hai.
4. Admin ko user ka **Registered Email**, **User ID**, **Amount (₹99)**, aur **UTR Number** dikhayi dega.
5. Admin apne UPI app me UTR verify karta hai aur **APPROVE** button dabata hai.
6. System automatically user ke exact database record me **+1 Credit** add kar deta hai.
7. User ka dashboard update hota hai aur balance 1 Credit show karta hai.

### Step 4: Running Safe Sandbox Tools
1. User **Tools** section me jata hai.
2. Pehla tool **Bound Gmail Checker** select karta hai.
3. Access Token enter karke **CHECK** dabata hai.
4. Server 1 Credit deduct karta hai aur Safe Sandbox output display karta hai:
   - **BOUND GMAIL**: `demo@example.com`
   - **STATUS**: `DEMO / SANDBOX`
   - **NOTE**: `Demo result — no third-party account was queried.`

### Step 5: Redeem Gift Codes
1. Admin Panel (`/admin/codes`) se 1, 5, ya 10 credits ka code generate karta hai (e.g. `BS-5-XYZAB`).
2. User ko code WhatsApp par bhejta hai.
3. User app me **Redeem Code** me code daal kar **CLAIM** karta hai.

---

## 🖼️ Replacing UPI QR Code Image
1. Apne UPI QR Code ki image file ko replace karein:
   `/public/static/images/upi-qr.svg` ya `/public/static/images/upi-qr.png`
2. Same path retain karein, application automatically aapke QR image ko Buy Credits page par render karegi.

---

## 🔒 Security & Safe Sandbox Declarations
This application strictly complies with safety boundaries:
- NO third-party account takeover or credential scraping.
- NO unauthorized access-token manipulation.
- NO third-party OTP interception.
- Real SMTP email authentication is restricted strictly to BINDSTORE's own registration flow.
