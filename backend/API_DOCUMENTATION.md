# Debt Collection System - API Documentation

## Base URL

```
http://localhost:3000/api
```

## Table of Contents

1. [Authentication](#authentication)
2. [Debtors Management](#debtors-management)
3. [Debts Management](#debts-management)
4. [M-Pesa Payments](#m-pesa-payments)
5. [WhatsApp Messaging](#whatsapp-messaging)
6. [AI-Powered Features](#ai-powered-features)
7. [Error Responses](#error-responses)
8. [Rate Limiting](#rate-limiting)

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Register User

**POST** `/auth/register`

Register a new user account.

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "COLLECTOR" // Optional: "ADMIN" or "COLLECTOR"
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "COLLECTOR"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

---

### Login

**POST** `/auth/login`

Authenticate and receive access tokens.

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "COLLECTOR"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

---

### Refresh Token

**POST** `/auth/refresh-token`

Get a new access token using a refresh token.

**Rate Limit:** 20 requests per 15 minutes

**Request Body:**

```json
{
  "refreshToken": "your_refresh_token"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

---

### Get Profile

**GET** `/auth/profile`

Get current user profile information.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "COLLECTOR",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### Logout

**POST** `/auth/logout`

Logout and invalidate tokens.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Forgot Password

**POST** `/auth/forgot-password`

Request a password reset link.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

---

### Reset Password

**POST** `/auth/reset-password`

Reset password using token from email.

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## Debtors Management

### Create Debtor

**POST** `/debtors`

Create a new debtor record.

**Authentication:** Required  
**Authorization:** ADMIN, COLLECTOR  
**Rate Limit:** 30 requests per 15 minutes

**Request Body:**

```json
{
  "name": "Jane Smith",
  "phone": "+254712345678",
  "email": "jane@example.com", // Optional
  "nationalId": "12345678", // Optional
  "status": "active" // Optional: "active", "inactive", "suspended"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Debtor created successfully",
  "data": {
    "id": "uuid",
    "name": "Jane Smith",
    "phone": "+254712345678",
    "email": "jane@example.com",
    "nationalId": "12345678",
    "status": "active",
    "userId": "creator_uuid",
    "createdAt": "2026-02-10T00:00:00.000Z",
    "updatedAt": "2026-02-10T00:00:00.000Z"
  }
}
```

---

### Get All Debtors

**GET** `/debtors`

Retrieve all debtors with optional filtering and pagination.

**Authentication:** Required

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `search` (string) - Search by name, phone, or email
- `status` (string) - Filter by status: "active", "inactive", "suspended"

**Example Request:**

```
GET /debtors?page=1&limit=20&search=jane&status=active
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "debtors": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "phone": "+254712345678",
        "email": "jane@example.com",
        "status": "active",
        "totalDebt": 50000,
        "createdAt": "2026-02-10T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### Get Debtor by ID

**GET** `/debtors/:id`

Get detailed information about a specific debtor.

**Authentication:** Required

**Query Parameters:**

- `include` (string) - Include related data: "debts", "reminders", "paymentPlans", "logs", "all"

**Example Request:**

```
GET /debtors/uuid-here?include=debts
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Smith",
    "phone": "+254712345678",
    "email": "jane@example.com",
    "nationalId": "12345678",
    "status": "active",
    "createdAt": "2026-02-10T00:00:00.000Z",
    "updatedAt": "2026-02-10T00:00:00.000Z",
    "debts": [
      {
        "id": "debt_uuid",
        "amount": 50000,
        "amountPaid": 10000,
        "dueDate": "2026-03-01T00:00:00.000Z",
        "status": "active"
      }
    ]
  }
}
```

---

### Update Debtor

**PUT** `/debtors/:id`

Update debtor information.

**Authentication:** Required  
**Authorization:** ADMIN, COLLECTOR  
**Rate Limit:** 30 requests per 15 minutes

**Request Body (all fields optional):**

```json
{
  "name": "Jane Doe",
  "phone": "+254712345679",
  "email": "jane.doe@example.com",
  "nationalId": "87654321",
  "status": "active"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Debtor updated successfully",
  "data": {
    "id": "uuid",
    "name": "Jane Doe",
    "phone": "+254712345679",
    "email": "jane.doe@example.com",
    "status": "active",
    "updatedAt": "2026-02-10T00:00:00.000Z"
  }
}
```

---

### Delete Debtor

**DELETE** `/debtors/:id`

Soft delete a debtor (marks as inactive).

**Authentication:** Required  
**Authorization:** ADMIN, COLLECTOR  
**Rate Limit:** 30 requests per 15 minutes

**Success Response (200):**

```json
{
  "success": true,
  "message": "Debtor deleted successfully"
}
```

---

## Debts Management

### Create Debt

**POST** `/debts`

Create a new debt record for a debtor.

**Authentication:** Required  
**Authorization:** ADMIN, COLLECTOR  
**Rate Limit:** 30 requests per 15 minutes

**Request Body:**

```json
{
  "debtorId": "debtor_uuid",
  "amount": 50000,
  "dueDate": "2026-03-01T00:00:00.000Z",
  "debtType": "ONE_TIME", // Optional: "ONE_TIME" or "INSTALLMENT"
  "amountPaid": 0, // Optional, default: 0
  "status": "pending" // Optional: "pending", "active", "completed", "cancelled"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Debt created successfully",
  "data": {
    "id": "uuid",
    "debtorId": "debtor_uuid",
    "userId": "creator_uuid",
    "amount": 50000,
    "amountPaid": 0,
    "dueDate": "2026-03-01T00:00:00.000Z",
    "debtType": "ONE_TIME",
    "status": "pending",
    "createdAt": "2026-02-10T00:00:00.000Z",
    "updatedAt": "2026-02-10T00:00:00.000Z"
  }
}
```

---

### Get All Debts

**GET** `/debts`

Retrieve all debts with filtering and pagination.

**Authentication:** Required

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `search` (string) - Search by debtor name
- `status` (string) - Filter by status: "pending", "active", "completed", "cancelled"
- `debtType` (string) - Filter by type: "ONE_TIME", "INSTALLMENT"
- `debtorId` (uuid) - Filter by specific debtor

**Example Request:**

```
GET /debts?page=1&limit=20&status=active&debtType=ONE_TIME
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "debts": [
      {
        "id": "uuid",
        "amount": 50000,
        "amountPaid": 10000,
        "dueDate": "2026-03-01T00:00:00.000Z",
        "status": "active",
        "debtType": "ONE_TIME",
        "debtor": {
          "id": "debtor_uuid",
          "name": "Jane Smith",
          "phone": "+254712345678"
        },
        "createdAt": "2026-02-10T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### Get Debt Statistics

**GET** `/debts/stats`

Get aggregated statistics about debts.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalDebts": 150,
    "totalAmount": 7500000,
    "totalPaid": 2500000,
    "totalOutstanding": 5000000,
    "byStatus": {
      "pending": 20,
      "active": 100,
      "completed": 25,
      "cancelled": 5
    },
    "byType": {
      "ONE_TIME": 100,
      "INSTALLMENT": 50
    }
  }
}
```

---

### Get Debt by ID

**GET** `/debts/:id`

Get detailed information about a specific debt.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "debtorId": "debtor_uuid",
    "userId": "creator_uuid",
    "amount": 50000,
    "amountPaid": 10000,
    "dueDate": "2026-03-01T00:00:00.000Z",
    "debtType": "ONE_TIME",
    "status": "active",
    "createdAt": "2026-02-10T00:00:00.000Z",
    "updatedAt": "2026-02-10T00:00:00.000Z",
    "debtor": {
      "id": "debtor_uuid",
      "name": "Jane Smith",
      "phone": "+254712345678",
      "email": "jane@example.com"
    }
  }
}
```

---

### Update Debt

**PUT** `/debts/:id`

Update debt information.

**Authentication:** Required  
**Authorization:** ADMIN, COLLECTOR  
**Rate Limit:** 30 requests per 15 minutes

**Request Body (all fields optional):**

```json
{
  "amount": 55000,
  "dueDate": "2026-03-15T00:00:00.000Z",
  "status": "active",
  "debtType": "INSTALLMENT"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Debt updated successfully",
  "data": {
    "id": "uuid",
    "amount": 55000,
    "dueDate": "2026-03-15T00:00:00.000Z",
    "status": "active",
    "updatedAt": "2026-02-10T00:00:00.000Z"
  }
}
```

---

### Delete Debt

**DELETE** `/debts/:id`

Soft delete a debt.

**Authentication:** Required  
**Authorization:** ADMIN, COLLECTOR  
**Rate Limit:** 30 requests per 15 minutes

**Success Response (200):**

```json
{
  "success": true,
  "message": "Debt deleted successfully"
}
```

---

### Record Payment

**POST** `/debts/:id/payment`

Record a payment against a debt.

**Authentication:** Required  
**Authorization:** ADMIN, COLLECTOR  
**Rate Limit:** 30 requests per 15 minutes

**Request Body:**

```json
{
  "amount": 10000,
  "paymentDate": "2026-02-10T00:00:00.000Z",
  "paymentMethod": "M-PESA", // Optional
  "notes": "Partial payment" // Optional
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "id": "uuid",
    "amount": 50000,
    "amountPaid": 20000,
    "remainingBalance": 30000,
    "status": "active",
    "updatedAt": "2026-02-10T00:00:00.000Z"
  }
}
```

---

## M-Pesa Payments

### Initiate Payment

**POST** `/mpesa/pay`

Initiate an M-Pesa STK push payment request.

**Authentication:** Required

**Request Body:**

```json
{
  "phone": "254712345678", // Without + prefix
  "amount": 100, // Minimum 1 KES
  "debtId": "debt_uuid", // Optional
  "debtorId": "debtor_uuid" // Optional
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "STK push sent successfully",
  "data": {
    "CheckoutRequestID": "ws_CO_10022026123456789",
    "MerchantRequestID": "12345-67890-1",
    "ResponseCode": "0",
    "ResponseDescription": "Success. Request accepted for processing",
    "CustomerMessage": "Success. Request accepted for processing"
  }
}
```

---

### Get Transaction Status

**GET** `/mpesa/transaction/:checkoutRequestID`

Get the status of a specific M-Pesa transaction.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "checkoutRequestID": "ws_CO_10022026123456789",
    "merchantRequestID": "12345-67890-1",
    "phone": "254712345678",
    "amount": 100,
    "status": "COMPLETED",
    "receiptNumber": "QBR12ABCDE",
    "debtId": "debt_uuid",
    "debtorId": "debtor_uuid",
    "createdAt": "2026-02-10T12:00:00.000Z",
    "updatedAt": "2026-02-10T12:01:00.000Z"
  }
}
```

**Transaction Status Values:**

- `PENDING` - Waiting for customer action
- `COMPLETED` - Payment successful
- `FAILED` - Payment failed
- `CANCELLED` - User cancelled
- `TIMEOUT` - Request timed out

---

### Get Debtor Transactions

**GET** `/mpesa/transactions/debtor/:debtorId`

Get all M-Pesa transactions for a specific debtor.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "checkoutRequestID": "ws_CO_10022026123456789",
      "phone": "254712345678",
      "amount": 100,
      "status": "COMPLETED",
      "receiptNumber": "QBR12ABCDE",
      "debtId": "debt_uuid",
      "createdAt": "2026-02-10T12:00:00.000Z"
    }
  ]
}
```

---

### Retry Failed Transaction

**POST** `/mpesa/retry/:transactionId`

Retry a failed M-Pesa transaction.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "message": "Transaction retry initiated",
  "data": {
    "transactionId": "uuid",
    "CheckoutRequestID": "ws_CO_10022026987654321",
    "status": "PENDING"
  }
}
```

---

### Process Failed Transactions

**POST** `/mpesa/process-failed`

Process all failed transactions and retry them.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "message": "Processing failed transactions",
  "data": {
    "processed": 5,
    "successful": 3,
    "failed": 2
  }
}
```

---

### Get Retry Statistics

**GET** `/mpesa/retry-stats`

Get statistics about transaction retries.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalRetries": 25,
    "successfulRetries": 18,
    "failedRetries": 7,
    "averageRetryTime": "45 seconds"
  }
}
```

---

### M-Pesa Callback (Webhook)

**POST** `/mpesa/callback`

**⚠️ Internal Use Only** - This endpoint is called by Safaricom to update transaction status.

**Authentication:** None (validated by M-Pesa)

---

## WhatsApp Messaging

All WhatsApp endpoints (except webhook verification) require authentication.

### Verify Configuration

**GET** `/whatsapp/verify`

Verify WhatsApp Business API configuration.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "message": "WhatsApp configuration is valid",
  "data": {
    "phoneNumberId": "123456789",
    "businessAccountId": "987654321",
    "configured": true
  }
}
```

---

### Send Hello World Template

**POST** `/whatsapp/send-hello`

Send a test hello_world template message.

**Authentication:** Required

**Request Body:**

```json
{
  "to": "254712345678" // 10-15 digits, no special characters
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Template message sent successfully",
  "data": {
    "messageId": "wamid.xxx=="
  }
}
```

---

### Send Message

**POST** `/whatsapp/send`

Send a text message to any phone number.

**Authentication:** Required

**Request Body:**

```json
{
  "to": "254712345678",
  "message": "Your payment reminder message here",
  "previewUrl": false // Optional, enable URL preview
}
```

**Message Limits:**

- Minimum: 1 character
- Maximum: 4096 characters

**Success Response (200):**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "wamid.xxx==",
    "to": "254712345678"
  }
}
```

---

### Send to Debtor

**POST** `/whatsapp/send-to-debtor/:debtorId`

Send a message to a debtor using their stored phone number.

**Authentication:** Required

**Request Body:**

```json
{
  "message": "Hello Jane, this is a reminder about your outstanding payment."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Message sent to debtor successfully",
  "data": {
    "messageId": "wamid.xxx==",
    "debtorId": "uuid",
    "debtorName": "Jane Smith",
    "phone": "+254712345678"
  }
}
```

---

### Send Template Message

**POST** `/whatsapp/send-template`

Send a WhatsApp template message.

**Authentication:** Required

**Request Body:**

```json
{
  "to": "254712345678",
  "templateName": "payment_reminder",
  "languageCode": "en", // Default: "en"
  "components": [] // Optional template parameters
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Template message sent successfully",
  "data": {
    "messageId": "wamid.xxx=="
  }
}
```

---

### Send Bulk Messages

**POST** `/whatsapp/send-bulk`

Send messages to multiple recipients (Admin only).

**Authentication:** Required  
**Authorization:** ADMIN

**Request Body:**

```json
{
  "phoneNumbers": ["254712345678", "254723456789", "254734567890"],
  "message": "Important announcement for all debtors"
}
```

**Limits:**

- Minimum: 1 phone number
- Maximum: 100 phone numbers per request

**Success Response (200):**

```json
{
  "success": true,
  "message": "Bulk messages sent successfully",
  "data": {
    "total": 3,
    "successful": 3,
    "failed": 0,
    "results": [
      {
        "phone": "254712345678",
        "messageId": "wamid.xxx==",
        "status": "sent"
      }
    ]
  }
}
```

---

## AI-Powered Features

### Test AI Connection

**GET** `/ai/test`

Test connection to Gemini AI service.

**Authentication:** Required

**Query Parameters:**

- `testMessage` (string, optional, max 100 chars) - Test message to send

**Success Response (200):**

```json
{
  "success": true,
  "message": "AI connection successful",
  "data": {
    "response": "AI response text",
    "model": "gemini-pro"
  }
}
```

---

### Analyze Message

**POST** `/ai/analyze-message`

Analyze a debtor's message using AI to understand intent and sentiment.

**Authentication:** Required

**Request Body:**

```json
{
  "debtorId": "debtor_uuid",
  "message": "I can pay 5000 next week, is that okay?"
}
```

**Message Limits:**

- Minimum: 1 character
- Maximum: 1000 characters

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "analysis": {
      "paymentIntent": "payment_plan_request",
      "proposedAmount": 5000,
      "proposedFrequency": "weekly",
      "emotionalTone": "cooperative",
      "financialCapability": "moderate",
      "suggestedResponse": "Thank you for your proposal. We can arrange a payment plan of 5000 per week.",
      "riskLevel": "low"
    }
  }
}
```

**Payment Intent Values:**

- `full_payment` - Willing to pay full amount
- `partial_payment` - Offering partial payment
- `payment_plan_request` - Requesting payment plan
- `dispute` - Disputing the debt
- `hardship` - Expressing financial hardship
- `no_intent` - No clear payment intent
- `inquiry` - Asking questions

**Emotional Tone Values:**

- `cooperative`, `frustrated`, `angry`, `desperate`, `neutral`, `confused`

**Financial Capability Values:**

- `strong`, `moderate`, `weak`, `unknown`

---

### Generate Payment Plan

**POST** `/ai/generate-payment-plan`

Generate a personalized payment plan using AI.

**Authentication:** Required

**Request Body:**

```json
{
  "debtorId": "debtor_uuid",
  "debtId": "debt_uuid",
  "analysis": {
    // Optional, from analyze-message response
    "paymentIntent": "payment_plan_request",
    "proposedAmount": 5000,
    "proposedFrequency": "weekly",
    "emotionalTone": "cooperative",
    "financialCapability": "moderate"
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment plan generated successfully",
  "data": {
    "paymentPlan": {
      "id": "plan_uuid",
      "debtorId": "debtor_uuid",
      "totalAmount": 50000,
      "installmentAmount": 5000,
      "frequency": "weekly",
      "numberOfInstallments": 10,
      "nextDueDate": "2026-02-17T00:00:00.000Z",
      "status": "ACTIVE",
      "installments": [
        {
          "number": 1,
          "amount": 5000,
          "dueDate": "2026-02-17T00:00:00.000Z"
        }
      ]
    }
  }
}
```

---

### Schedule Reminders

**POST** `/ai/schedule-reminders`

Schedule automated reminders for a payment plan.

**Authentication:** Required

**Request Body:**

```json
{
  "paymentPlanId": "plan_uuid"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Reminders scheduled successfully",
  "data": {
    "remindersCreated": 10,
    "reminders": [
      {
        "id": "reminder_uuid",
        "scheduledFor": "2026-02-16T09:00:00.000Z",
        "message": "Reminder: Payment of KES 5,000 is due tomorrow",
        "channel": "WHATSAPP",
        "status": "PENDING"
      }
    ]
  }
}
```

---

### Send Reminder

**POST** `/ai/send-reminder`

Send a specific reminder immediately.

**Authentication:** Required

**Request Body:**

```json
{
  "reminderId": "reminder_uuid"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Reminder sent successfully",
  "data": {
    "reminderId": "reminder_uuid",
    "sentAt": "2026-02-10T12:00:00.000Z",
    "status": "SENT",
    "channel": "WHATSAPP"
  }
}
```

---

### Get Pending Reminders

**GET** `/ai/pending-reminders`

Get all pending reminders for the authenticated user.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "total": 15,
    "reminders": [
      {
        "id": "reminder_uuid",
        "debtorId": "debtor_uuid",
        "debtorName": "Jane Smith",
        "message": "Payment reminder",
        "channel": "WHATSAPP",
        "scheduledFor": "2026-02-16T09:00:00.000Z",
        "status": "PENDING",
        "attempts": 0
      }
    ]
  }
}
```

---

### Trigger Scheduler (Admin)

**POST** `/ai/trigger-scheduler`

Manually trigger the reminder scheduler.

**Authentication:** Required  
**Authorization:** ADMIN

**Success Response (200):**

```json
{
  "success": true,
  "message": "Scheduler triggered successfully",
  "data": {
    "remindersSent": 5,
    "timestamp": "2026-02-10T12:00:00.000Z"
  }
}
```

---

### Get Scheduler Status (Admin)

**GET** `/ai/scheduler-status`

Get the current status of the reminder scheduler.

**Authentication:** Required  
**Authorization:** ADMIN

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "lastRun": "2026-02-10T12:00:00.000Z",
    "nextRun": "2026-02-10T13:00:00.000Z",
    "totalRemindersProcessed": 245,
    "successRate": "94%"
  }
}
```

---

### AI Webhook Verification

**GET** `/ai/webhook`

Verify WhatsApp webhook (for Meta integration).

**⚠️ Public Endpoint** - No authentication required

**Query Parameters:**

- `hub.mode`
- `hub.verify_token`
- `hub.challenge`

---

### AI Webhook Handler

**POST** `/ai/webhook`

Handle incoming WhatsApp messages via webhook.

**⚠️ Public Endpoint** - No authentication required

---

## Error Responses

### Standard Error Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

### Common HTTP Status Codes

#### 400 Bad Request

Invalid request data or validation errors.

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

#### 401 Unauthorized

Missing or invalid authentication token.

```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 403 Forbidden

Insufficient permissions for the requested resource.

```json
{
  "success": false,
  "message": "You don't have permission to perform this action"
}
```

#### 404 Not Found

Requested resource doesn't exist.

```json
{
  "success": false,
  "message": "Debtor not found"
}
```

#### 409 Conflict

Resource conflict (e.g., duplicate email).

```json
{
  "success": false,
  "message": "Email already registered"
}
```

#### 429 Too Many Requests

Rate limit exceeded.

```json
{
  "success": false,
  "message": "Too many authentication attempts, please try again later."
}
```

#### 500 Internal Server Error

Server-side error.

```json
{
  "success": false,
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

The API implements rate limiting on various endpoints to prevent abuse:

### Authentication Endpoints

- **Login/Register:** 5 requests per 15 minutes per IP
- **Refresh Token:** 20 requests per 15 minutes per IP

### Mutation Operations

- **Create/Update/Delete (Debtors, Debts):** 30 requests per 15 minutes per IP

### Rate Limit Headers

When a rate limit is applied, the response includes these headers:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1707571200
```

---

## Authentication Flow

### Initial Authentication

1. Register or login to receive `accessToken` and `refreshToken`
2. Store both tokens securely
3. Include `accessToken` in Authorization header: `Bearer <token>`

### Token Refresh

1. When `accessToken` expires (401 error), use `refreshToken`
2. Call `POST /auth/refresh-token` with refresh token
3. Receive new `accessToken`
4. Update stored token and retry original request

### Example (JavaScript)

```javascript
// Login
const loginResponse = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const { data } = await loginResponse.json();
localStorage.setItem("accessToken", data.accessToken);
localStorage.setItem("refreshToken", data.refreshToken);

// Make authenticated request
const response = await fetch("/api/debtors", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

// Handle token expiration
if (response.status === 401) {
  const refreshResponse = await fetch("/api/auth/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken: localStorage.getItem("refreshToken"),
    }),
  });

  const { data } = await refreshResponse.json();
  localStorage.setItem("accessToken", data.accessToken);

  // Retry original request
  const retryResponse = await fetch("/api/debtors", {
    headers: {
      Authorization: `Bearer ${data.accessToken}`,
    },
  });
}
```

---

## Data Models

### User

```typescript
{
  id: string(uuid);
  name: string;
  email: string(unique);
  role: "ADMIN" | "COLLECTOR";
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Debtor

```typescript
{
  id: string (uuid)
  name: string
  phone: string
  email?: string
  nationalId?: string (unique)
  status: "active" | "inactive" | "suspended"
  userId: string (creator)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Debt

```typescript
{
  id: string(uuid);
  debtorId: string;
  userId: string(owner);
  amount: number;
  amountPaid: number;
  dueDate: DateTime;
  debtType: "ONE_TIME" | "INSTALLMENT";
  status: "pending" | "active" | "completed" | "cancelled";
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Reminder

```typescript
{
  id: string (uuid)
  debtorId: string
  userId: string
  message: string
  channel: "SMS" | "WHATSAPP"
  status: "PENDING" | "SENT" | "FAILED"
  scheduledFor?: DateTime
  sentAt?: DateTime
  attempts: number
  createdAt: DateTime
}
```

### Payment Plan

```typescript
{
  id: string(uuid);
  debtorId: string;
  createdById: string;
  totalAmount: number;
  installmentAmount: number;
  frequency: string;
  nextDueDate: DateTime;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### M-Pesa Transaction

```typescript
{
  id: string (uuid)
  checkoutRequestID: string (unique)
  merchantRequestID: string
  phone: string (254 format)
  amount: number
  debtId?: string
  debtorId?: string
  userId?: string
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "TIMEOUT"
  receiptNumber?: string
  errorMessage?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## Environment Variables

Required environment variables for backend configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dcs_db

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# M-Pesa
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-account-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_VERIFY_TOKEN=your-verify-token

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## Testing

### Health Check

Test if the server is running:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### Postman Collection

Import the API endpoints into Postman for easy testing:

1. Create a new collection named "DCS API"
2. Set collection variables:
   - `baseUrl`: `http://localhost:3000/api`
   - `accessToken`: (set after login)
3. Add pre-request script to automatically include auth header:

```javascript
pm.request.headers.add({
  key: "Authorization",
  value: "Bearer " + pm.collectionVariables.get("accessToken"),
});
```

---

## Webhooks

### M-Pesa Callback Configuration

Configure in your M-Pesa Daraja portal:

**Callback URL:** `https://yourdomain.com/api/mpesa/callback`

### WhatsApp Webhook Configuration

Configure in your Meta Developer Console:

**Verification URL:** `https://yourdomain.com/api/ai/webhook`  
**Callback URL:** `https://yourdomain.com/api/ai/webhook`  
**Verify Token:** (from your .env file)

**Subscribe to events:**

- `messages` - Receive incoming messages
- `message_status` - Receive message delivery status

---

## Best Practices

### Security

1. Always use HTTPS in production
2. Store tokens securely (httpOnly cookies or secure storage)
3. Never commit sensitive credentials to version control
4. Rotate API keys and secrets regularly
5. Implement proper CORS policies

### API Usage

1. Handle rate limits gracefully with exponential backoff
2. Cache frequently accessed data when appropriate
3. Use pagination for large datasets
4. Validate data on client-side before sending requests
5. Implement proper error handling and user feedback

### Phone Numbers

- Store phone numbers in international format with country code
- M-Pesa expects Kenyan numbers in format: `254XXXXXXXXX` (without +)
- WhatsApp expects numbers without + or special characters

---

## Support

For issues or questions:

- Email: support@dcs-system.com
- Documentation: https://docs.dcs-system.com
- GitHub Issues: https://github.com/yourusername/dcs/issues

---

**Version:** 1.0.0  
**Last Updated:** February 10, 2026
