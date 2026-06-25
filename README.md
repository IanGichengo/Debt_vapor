# Debt  Vapor  Documentation

> Everything you need to set up, configure, and run DCS — from first login to production-ready automation.

---

## Table of Contents

- [Quick Start](#quick-start)
- [WhatsApp Setup](#whatsapp-setup)
- [M-Pesa Setup](#m-pesa-setup)
- [Managing Debtors](#managing-debtors)
- [Reminder Scheduler](#reminder-scheduler)
- [AI & Automation](#ai--automation)
- [Payment Plans](#payment-plans)
- [Team & Roles](#team--roles)
- [API Reference](#api-reference)

---

## Quick Start

Get Debt Vapor  running from a fresh account to your first automated WhatsApp reminder in under 15 minutes.

### Prerequisites

- A **Meta Developer account** with a WhatsApp Business App and verified phone number
- A **Safaricom Daraja API account** with a registered Paybill or Till Number
- Your **Node.js backend running** locally with ngrok or on a hosted server

### Step 1 — Configure environment variables

In your DCS backend folder, create or update your `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:5432/dcs_db"
JWT_SECRET="your-long-random-secret-here"

# WhatsApp
WHATSAPP_TOKEN="EAAxxxx..."
WHATSAPP_PHONE_ID="123456789"
WHATSAPP_VERIFY_TOKEN="your_custom_verify_token"

# M-Pesa
MPESA_CONSUMER_KEY="xxxx"
MPESA_CONSUMER_SECRET="xxxx"
MPESA_SHORTCODE="174379"
MPESA_PASSKEY="xxxx"
MPESA_CALLBACK_URL="https://yourdomain.com/api/mpesa/callback"

# Gemini AI
GEMINI_API_KEY="AIzaSy..."

PORT=3000
NODE_ENV=development
```

### Step 2 — Start the server

```bash
cd DCS/backend
npm install
npx prisma migrate dev --name init
npm start
```

> ✅ You should see: `Server is running on port 3000` and `✓ AI Reminder Scheduler initialized`

### Step 3 — Expose your server (local dev)

```bash
# Static ngrok domain (recommended):
ngrok http --url=your-domain.ngrok-free.dev 3000

# Dynamic URL (changes each session):
ngrok http 3000
```

### Step 4 — Add your first debtor and send a reminder

1. Log in to your dashboard and go to **Debtors → Add Debtor**
2. Fill in name, phone number (format: `254712345678`), and debt amount
3. Open the debtor's profile → click **Send Reminder** → confirm
4. Check the debtor's WhatsApp — the message should arrive within seconds

---

## WhatsApp Setup

DCS uses Meta's WhatsApp Business Cloud API. This covers the full setup from Meta dashboard to working webhook.

### 1. Create a Meta App

- Go to [developers.facebook.com](https://developers.facebook.com) → **Create App** → select Business type
- From your app dashboard, find **WhatsApp** in Add Products and click Set Up

### 2. Get your credentials

In **WhatsApp → API Setup**:

- **Access Token** — use the temporary token for testing. Generate a permanent System User token via Meta Business Suite for production.
- **Phone Number ID** — add to `WHATSAPP_PHONE_ID` in your `.env`
- **WABA ID** — WhatsApp Business Account ID, needed to subscribe webhooks

### 3. Configure the Webhook

```
Callback URL:  https://your-domain.app/api/whatsapp/webhook
Verify Token:  (value of WHATSAPP_VERIFY_TOKEN in your .env)
```

> ⚠️ The callback URL must end with `/api/whatsapp/webhook`. Your server must be running when you click **Verify and Save**.

### 4. Subscribe to messages

After saving the webhook: **Webhook Fields → Manage → subscribe to messages**. Without this, debtor replies will never reach your server.

### 5. Subscribe your WABA to the app

```bash
curl -X POST \
  "https://graph.facebook.com/v17.0/YOUR_WABA_ID/subscribed_apps" \
  -H "Authorization: Bearer YOUR_WHATSAPP_TOKEN"
# Expected: { "success": true }
```

### 6. Switch to Live Mode

In Development Mode, only verified test numbers can send messages. Switch to **Live Mode** via the Meta dashboard top bar to receive messages from real debtors. You'll need a privacy policy URL — use `yourdomain.com/privacy`.

---

## M-Pesa Setup

DCS integrates with Safaricom's Daraja API to initiate STK push payment requests on behalf of your clients.

### 1. Register on Daraja

- Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke) and create a developer account
- Go to **My Apps → Add a New App** → select Lipa Na M-Pesa Sandbox
- Copy your **Consumer Key** and **Consumer Secret**

### 2. Sandbox test credentials

```env
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENVIRONMENT=sandbox
```

### 3. Callback URL

```env
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
```

> ⚠️ Must be a public HTTPS URL. Safaricom cannot reach localhost. Use ngrok during development.

### 4. Testing STK Push

Use the Daraja sandbox test phone `254708374149` with PIN `12345`. Trigger a test from any debtor's profile → **Send Payment Request**.

### 5. Going to production

Apply for a production app at developer.safaricom.co.ke under **Go Live**. Replace sandbox credentials with production values and set `MPESA_ENVIRONMENT=production`.

---

## Managing Debtors

Debtors are the core entity in DCS. Each profile links to debts, a WhatsApp chat log, and reminder settings.

### Adding a debtor

1. Go to **Debtors** in the sidebar → **Add Debtor**
2. Fill in: Full Name (required), Phone (required), Email (optional), National ID (optional)
3. Click **Save** — then from the profile click **Add Debt**: enter amount, due date, creditor name, debt type

### Phone number format

```
✅ 254712345678    (international, no plus)
✅ +254712345678   (with plus — also accepted)
✅ 0712345678      (local format — also accepted)
❌ 712345678       (missing country code)
```

DCS normalises all three formats when matching incoming WhatsApp replies to debtor profiles.

### Debt statuses

```
pending   → Unpaid and active. Reminders will fire.
active    → Debtor engaged (on payment plan). AI continues conversations.
settled   → Fully paid. Reminders stop automatically.
disputed  → Debtor raised a dispute. Flagged for manual review.
```

---

## Reminder Scheduler

The automated scheduler runs every hour and sends WhatsApp reminders to eligible debtors without any manual input.

### How it works

On each hourly run, the scheduler looks for debtors who have an active debt, reminder settings enabled, haven't been messaged within their configured interval, and haven't exceeded their maximum reminder count.

### Per-debtor configuration

```
Enabled:       true / false
Interval:      3 | 7 | 14 | 30  (days between reminders)
Max Reminders: 1 | 2 | 3 | 5 | 10 (total before stopping)
```

> ℹ️ Max Reminders: 3 + Interval: 7 days = reminders on day 0, 7, and 14 — then the scheduler stops for that debtor automatically.

### Organisation defaults

Set default reminder settings for all new debtors under **Settings → Default Reminder Settings**. Applied automatically when a new debtor is created.

### Duplicate protection

Built-in duplicate send protection prevents the same debtor from receiving multiple reminders within their interval. A `warn: Duplicate reminder blocked` log entry appears when this fires.

---

## AI & Automation

When a debtor replies to a WhatsApp message, Gemini AI analyses the text and responds automatically.

### The AI pipeline

1. Debtor reply arrives at `POST /api/whatsapp/webhook`
2. DCS looks up the debtor by phone number (normalised across formats)
3. Message text + debt context sent to Gemini API for analysis
4. AI returns intent classification, tone, and suggested response
5. DCS routes to the appropriate handler and sends the response
6. Interaction logged to debtor's chat history and database

### Intent classifications

```
full_payment         → STK push fires for full outstanding amount
partial_payment      → STK push fires for debtor's proposed amount
payment_plan_request → AI generates a payment plan and sends schedule
dispute              → Escalation message sent, flagged for manual review
hardship             → Empathetic response + flexible plan offered
inquiry              → Account summary (balance, due date) sent
general              → Menu response with options 1–4
```

### AI analysis object

```json
{
  "paymentIntent": "full_payment",
  "emotionalTone": "cooperative",
  "urgency": "high",
  "proposedAmount": 2500,
  "confidence": 0.92,
  "keyPoints": ["wants to pay today"],
  "responseMessage": "Asante! Nitatuma ombi..."
}
```

**`emotionalTone`** values: `cooperative` | `hostile` | `distressed` | `neutral`
**`urgency`** values: `high` | `medium` | `low`

### Unknown debtors

If a message comes from a number not in your database, DCS automatically creates a new debtor profile, sends a welcome message, and adds the entry to your Debtors list for you to update.

---

## Payment Plans

Payment plans can be created automatically by the AI or manually from the dashboard.

### AI-generated plans

When the AI detects a `payment_plan_request`, it automatically:
- Calculates instalments from the outstanding balance (or debtor's proposed amount)
- Proposes a frequency
- Creates the plan in the database
- Sends the schedule via WhatsApp
- Schedules automated reminders for each instalment date

### Manual plan creation

From a debtor's profile → **Add Payment Plan** → fill in total amount, instalment amount, frequency, and first payment date. The system calculates the number of instalments automatically.

### Plan statuses

```
ACTIVE    → Running. Instalments being tracked.
COMPLETED → All instalments paid. Debt settled automatically.
CANCELLED → Cancelled manually or debtor defaulted.
```

---

## Team & Roles

DCS uses two roles: **Admin** (full access) and **Collector** (restricted to assigned debtors).

### Role permissions

```
ADMIN
├── Full access to all debtors and debts
├── Add / remove Collectors
├── Billing and subscription settings
├── Organisation-wide reminder defaults
└── Full audit logs

COLLECTOR
├── View and manage assigned debtors
├── Send manual reminders
├── Update debt statuses and amounts
├── View their debtors' chat logs
└── No access to: billing, settings, other collectors' data
```

### Adding a team member

1. **Settings → Team → Invite Collector**
2. Enter their email and click **Send Invite**
3. They receive a secure link to set their password and log in

---

## API Reference

DCS exposes a REST API. All endpoints require a JWT Bearer token except the public webhook endpoints.

### Authentication

```bash
# Get your token
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}'

# Use the token
curl https://your-domain.com/api/debtors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Key endpoints

```
# Auth
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/profile
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

# Debtors
GET    /api/debtors
POST   /api/debtors
GET    /api/debtors/:id
PUT    /api/debtors/:id
DELETE /api/debtors/:id
GET    /api/debtors/:id/chats

# Debts
GET    /api/debts
POST   /api/debts
PUT    /api/debts/:id
GET    /api/debts/dashboard-stats
GET    /api/debts/bulk-summary

# WhatsApp
POST   /api/whatsapp/send-to-debtor/:id
POST   /api/whatsapp/send
GET    /api/whatsapp/webhook    (public — verification)
POST   /api/whatsapp/webhook    (public — incoming messages)

# M-Pesa
POST   /api/mpesa/stk-push
POST   /api/mpesa/callback      (public — Safaricom callback)

# Notifications
GET    /api/notifications/statuses
PUT    /api/notifications/:id/read
```

### Error format

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": []
}
```

| HTTP Code | Meaning |
|-----------|---------|
| `400` | Bad request / validation error |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient role) |
| `404` | Not found |
| `500` | Internal server error |

> ℹ️ A full Postman collection with example payloads is available on request — email **support@dcs.co.ke**.

---

*DCS Developer & User Docs*
