# Finova Backend API — Complete Reference

This document describes every REST endpoint in the Finova money-management backend. Share it with frontend developers or anyone integrating a client app.

---

## Table of contents

1. [Overview](#1-overview)
2. [Environment & base URL](#2-environment--base-url)
3. [Authentication](#3-authentication)
4. [Request & response format](#4-request--response-format)
5. [Error handling](#5-error-handling)
6. [Enums & constants](#6-enums--constants)
7. [Endpoints by module](#7-endpoints-by-module)
   - [Health](#71-health)
   - [Auth](#72-auth)
   - [Users](#73-users)
   - [Transactions](#74-transactions)
   - [Budgets](#75-budgets)
   - [Goals](#76-goals-savings)
   - [Analytics](#77-analytics)
   - [Notifications](#78-notifications)
   - [AI Insights](#79-ai-insights)
8. [Frontend integration guide](#8-frontend-integration-guide)
9. [Swagger (interactive docs)](#9-swagger-interactive-docs)
10. [Demo account](#10-demo-account)

---

## 1. Overview

| Item | Value |
|------|--------|
| Framework | NestJS 11 |
| API style | REST JSON |
| API prefix | `/api/v1` |
| Default port | `3001` |
| Database | PostgreSQL (Prisma ORM) |
| Auth | JWT in **HttpOnly cookies** + optional Bearer header |
| Rate limit | 100 requests per 60 seconds per IP |

All protected routes require a valid session (cookie or Bearer token). Data is scoped per user — you only see your own transactions, budgets, goals, etc.

---

## 2. Environment & base URL

### Backend `.env` (required)

```env
DATABASE_URL="postgresql://finova:finova_secret@localhost:5432/finova_db?schema=public"
JWT_SECRET="your-secret-min-32-characters-long"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-characters"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:3001/api/v1/auth/google/callback"
COOKIE_SECURE=false
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Base URL examples

| Environment | Base URL |
|-------------|----------|
| Local dev | `http://localhost:3001/api/v1` |
| Production | `https://api.yourdomain.com/api/v1` |

Every endpoint below is relative to this base URL.

**Example:** Login → `POST http://localhost:3001/api/v1/auth/login`

---

## 3. Authentication

### How it works

1. User calls **register** or **login**.
2. Server returns JSON with `user` (and optionally `accessToken` in body).
3. Server sets two **HttpOnly cookies**:
   - `access_token` — expires in **15 minutes**
   - `refresh_token` — expires in **7 days**
4. Browser/client must send cookies on every request (`credentials: 'include'` in fetch, `withCredentials: true` in Axios).
5. When `access_token` expires, call **POST /auth/refresh** with the `refresh_token` cookie.
6. **logout** clears cookies and deletes the refresh session in the database.

### Alternative: Bearer token

You may also send the access token in the header (useful for mobile or non-browser clients):

```http
Authorization: Bearer <access_token>
```

The JWT strategy reads the token from **cookie first**, then from this header.

### Cookies (browser clients)

| Cookie | HttpOnly | SameSite | Path | Max age |
|--------|----------|----------|------|---------|
| `access_token` | yes | lax | `/` | 15 min |
| `refresh_token` | yes | lax | `/` | 7 days |

### CORS

The API allows requests from `FRONTEND_URL` with:

- `credentials: true`
- Methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Headers: `Content-Type`, `Authorization`

### Public vs protected routes

| Type | Meaning |
|------|---------|
| **Public** | No auth required (register, login, refresh, forgot password, health) |
| **Protected** | Valid JWT required; returns `401` if missing or invalid |

---

## 4. Request & response format

### Request headers (typical)

```http
Content-Type: application/json
Cookie: access_token=...; refresh_token=...
```

### Success response wrapper

Every successful response is wrapped by a global interceptor:

```json
{
  "success": true,
  "data": { },
  "timestamp": "2026-05-19T12:00:00.000Z"
}
```

**Important for frontend:** Read the payload from `response.data.data` (Axios) or unwrap `data` once in an interceptor.

### Pagination (where applicable)

List endpoints return:

```json
{
  "success": true,
  "data": {
    "items": [ ],
    "meta": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "..."
}
```

Query parameters for pagination:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number (min 1) |
| `limit` | number | 20 | Items per page (max 100) |
| `search` | string | — | Text search (where supported) |

---

## 5. Error handling

### Error response shape

```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2026-05-19T12:00:00.000Z",
  "path": "/api/v1/auth/login",
  "message": "Invalid credentials"
}
```

Validation errors may return `message` as an array of strings.

### Common HTTP status codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created (implicit via 200 in most routes) |
| 400 | Bad request / validation failed |
| 401 | Unauthorized (not logged in or token expired) |
| 403 | Forbidden (e.g. wrong role) |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already registered) |
| 429 | Too many requests (rate limit) |
| 500 | Internal server error |

### Token refresh flow (frontend)

```
Request → 401 Unauthorized
    ↓
POST /auth/refresh (with refresh_token cookie)
    ↓
Success → retry original request
    ↓
Failure → redirect to /login
```

---

## 6. Enums & constants

Use these exact values in request bodies and query params.

### TransactionType

| Value | Description |
|-------|-------------|
| `INCOME` | Money in |
| `EXPENSE` | Money out |

### TransactionStatus

| Value | Description |
|-------|-------------|
| `COMPLETED` | Settled |
| `PENDING` | Not yet settled |

### BudgetPeriod

| Value | Description |
|-------|-------------|
| `WEEKLY` | Weekly budget |
| `MONTHLY` | Monthly budget (default) |
| `YEARLY` | Yearly budget |

### NotificationType (response)

| Value | UI type |
|-------|---------|
| `ALERT` | `alert` |
| `INFO` | `info` |
| `SUCCESS` | `success` |

### InsightType (response)

| Value | Description |
|-------|-------------|
| `SUBSCRIPTION` | Subscription spending |
| `SPENDING` | Spending patterns |
| `SAVINGS` | Savings suggestions |
| `INVESTMENT` | Investment opportunities |

### Role (user)

| Value | Description |
|-------|-------------|
| `USER` | Standard user |
| `ADMIN` | Administrator |

---

## 7. Endpoints by module

---

### 7.1 Health

#### `GET /health`

Check API availability. **Public.**

**Response `data`:**

```json
{
  "status": "ok",
  "service": "finova-api"
}
```

---

### 7.2 Auth

Base path: `/auth`

#### `POST /auth/register` — Public

Create a new account.

**Body:**

```json
{
  "firstName": "Alex",
  "lastName": "Rivers",
  "email": "alex@example.com",
  "password": "Password123!"
}
```

| Field | Type | Rules |
|-------|------|-------|
| firstName | string | min 2 chars |
| lastName | string | min 2 chars |
| email | string | valid email |
| password | string | min 8 chars |

**Response `data`:**

```json
{
  "user": {
    "id": "uuid",
    "email": "alex@example.com",
    "firstName": "Alex",
    "lastName": "Rivers",
    "avatar": null,
    "plan": "Starter",
    "role": "USER",
    "currency": "USD",
    "darkMode": false,
    "emailVerified": false
  },
  "accessToken": "eyJhbG..."
}
```

Sets `access_token` and `refresh_token` cookies.

**Errors:** `409` if email already exists.

---

#### `POST /auth/login` — Public

**Body:**

```json
{
  "email": "demo@finova.app",
  "password": "Password123!"
}
```

**Response:** Same shape as register (`user` + `accessToken` + cookies).

**Errors:** `401` Invalid credentials.

---

#### `POST /auth/logout` — Protected

Invalidate refresh session and clear cookies.

**Response `data`:**

```json
{
  "message": "Logged out successfully"
}
```

---

#### `POST /auth/refresh` — Public

Issue new tokens using `refresh_token` cookie. No body required.

**Response:** Same as login (`user` + cookies).

**Errors:** `401` if refresh token missing, invalid, or expired.

---

#### `POST /auth/forgot-password` — Public

**Body:**

```json
{
  "email": "alex@example.com"
}
```

**Response `data`:** (always generic for security)

```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

In development, reset token is logged on the server console.

---

#### `POST /auth/reset-password` — Public

**Body:**

```json
{
  "token": "hex-token-from-email",
  "password": "NewPassword123!"
}
```

**Response `data`:**

```json
{
  "message": "Password reset successfully"
}
```

**Errors:** `400` invalid or expired token.

---

#### `GET /auth/verify-email?token=...` — Public

Verify email with token sent at registration.

**Query:** `token` (string)

**Response `data`:**

```json
{
  "message": "Email verified successfully"
}
```

---

#### `GET /auth/google` — Public

Starts Google OAuth flow. Redirects to Google (requires `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).

---

#### `GET /auth/google/callback` — Public

OAuth callback. On success redirects to `{FRONTEND_URL}/dashboard` with cookies set. On failure redirects to `{FRONTEND_URL}/login?error=oauth`.

---

#### `GET /auth/me` — Protected

Returns JWT payload for current user.

**Response `data`:**

```json
{
  "sub": "user-uuid",
  "email": "demo@finova.app",
  "role": "USER"
}
```

---

### 7.3 Users

Base path: `/users` — **All protected**

#### `GET /users/profile`

Full profile for the logged-in user.

**Response `data`:**

```json
{
  "id": "uuid",
  "email": "demo@finova.app",
  "firstName": "Alex",
  "lastName": "Rivers",
  "phone": "+1 (555) 012-3456",
  "avatar": "https://...",
  "plan": "Finova Plus",
  "location": "San Francisco, CA",
  "currency": "USD",
  "darkMode": false,
  "role": "USER",
  "emailVerified": true,
  "notificationPrefs": {
    "budgetAlerts": true,
    "emailNotifications": true
  },
  "createdAt": "2023-03-01T00:00:00.000Z",
  "memberSince": "March 2023"
}
```

---

#### `PATCH /users/profile`

Update profile fields. Send only fields you want to change.

**Body (all optional):**

```json
{
  "firstName": "Alex",
  "lastName": "Rivers",
  "phone": "+1 555 0000",
  "location": "New York, NY",
  "avatar": "https://example.com/avatar.png",
  "currency": "EUR",
  "darkMode": true
}
```

**Response `data`:** Updated user fields (subset of profile).

---

#### `PATCH /users/notification-preferences`

**Body (all optional):**

```json
{
  "budgetAlerts": true,
  "savingsReminders": true,
  "emailNotifications": false,
  "systemNotifications": true
}
```

**Response `data`:**

```json
{
  "notificationPrefs": { }
}
```

---

### 7.4 Transactions

Base path: `/transactions` — **All protected**

#### `POST /transactions`

Create income or expense.

**Body:**

```json
{
  "name": "Starbucks",
  "description": "Morning coffee",
  "amount": 12.5,
  "type": "EXPENSE",
  "status": "COMPLETED",
  "categoryId": "uuid-of-category",
  "currency": "USD",
  "notes": "Optional note",
  "date": "2024-05-17",
  "isRecurring": false,
  "recurringInterval": "monthly",
  "receiptUrl": "https://example.com/receipt.jpg"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| name | yes | Display name |
| amount | yes | Positive number (min 0.01) |
| type | yes | `INCOME` or `EXPENSE` |
| date | yes | ISO date string `YYYY-MM-DD` |
| description, categoryId, currency, notes, status, isRecurring, recurringInterval, receiptUrl | no | |

**Response `data`:** (frontend-friendly shape)

```json
{
  "id": "uuid",
  "name": "Starbucks",
  "category": "Dining",
  "amount": -12.5,
  "type": "expense",
  "date": "2024-05-17",
  "status": "completed"
}
```

Note: Expenses are returned as **negative** `amount` in list/detail responses.

---

#### `GET /transactions`

List transactions with filters and pagination.

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page (default 1) |
| limit | number | Per page (default 20, max 100) |
| search | string | Search name/description |
| type | enum | `INCOME` or `EXPENSE` |
| status | enum | `COMPLETED` or `PENDING` |
| categoryId | string | Filter by category UUID |
| startDate | string | ISO date from |
| endDate | string | ISO date to |
| minAmount | number | Minimum amount |
| maxAmount | number | Maximum amount |

**Example:** `GET /transactions?type=EXPENSE&page=1&limit=10&startDate=2024-05-01`

**Response `data`:**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Starbucks",
      "category": "Dining",
      "amount": -12.5,
      "type": "expense",
      "date": "2024-05-17",
      "status": "completed"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

#### `GET /transactions/categories`

List categories available to the user (defaults + user-specific).

**Response `data`:** Array of:

```json
{
  "id": "uuid",
  "name": "Dining",
  "icon": "Utensils",
  "color": null,
  "type": "EXPENSE",
  "isDefault": true,
  "createdAt": "..."
}
```

---

#### `GET /transactions/:id`

Single transaction by ID (must belong to current user).

**Response `data`:** Same object as one item in the list.

**Errors:** `404` if not found.

---

#### `PATCH /transactions/:id`

Partial update. Same fields as create (all optional).

**Response `data`:** Updated transaction object.

---

#### `DELETE /transactions/:id`

**Response `data`:**

```json
{
  "message": "Transaction deleted"
}
```

---

### 7.5 Budgets

Base path: `/budgets` — **All protected**

#### `POST /budgets`

**Body:**

```json
{
  "name": "Food",
  "limit": 800,
  "categoryId": "optional-uuid",
  "period": "MONTHLY",
  "month": 5,
  "year": 2024,
  "icon": "Utensils"
}
```

| Field | Required | Default |
|-------|----------|---------|
| name | yes | — |
| limit | yes | min 0 |
| period | no | `MONTHLY` |
| month, year | no | Current month/year |
| categoryId, icon | no | — |

**Response `data`:**

```json
{
  "id": "uuid",
  "name": "Food",
  "spent": 0,
  "limit": 800,
  "icon": "Utensils",
  "overBudget": false,
  "percentUsed": 0
}
```

---

#### `GET /budgets`

List budgets for a month.

**Query:**

| Param | Type | Default |
|-------|------|---------|
| month | number | Current month (1–12) |
| year | number | Current year |

**Example:** `GET /budgets?month=5&year=2024`

**Response `data`:** Array of budget objects (same shape as create response).

When spending exceeds limit, server may create a **budget alert notification** automatically.

---

#### `GET /budgets/analytics`

**Response `data`:**

```json
{
  "totalLimit": 3400,
  "totalSpent": 2525,
  "remaining": 875,
  "overBudgetCount": 1,
  "categories": [ ]
}
```

---

#### `GET /budgets/:id`

**Response `data`:** Single budget object.

---

#### `PATCH /budgets/:id`

Partial update (name, limit, period, month, year, icon, categoryId).

---

#### `DELETE /budgets/:id`

**Response `data`:**

```json
{
  "message": "Budget deleted"
}
```

---

### 7.6 Goals (Savings)

Base path: `/goals` — **All protected**

#### `POST /goals`

**Body:**

```json
{
  "name": "New Home Fund",
  "target": 50000,
  "saved": 0,
  "deadline": "2024-12-31",
  "icon": "Home",
  "category": "Property"
}
```

| Field | Required |
|-------|----------|
| name | yes |
| target | yes (min 1) |
| saved, deadline, icon, category | no |

**Response `data`:**

```json
{
  "id": "uuid",
  "name": "New Home Fund",
  "saved": 0,
  "target": 50000,
  "deadline": "Dec 2024",
  "icon": "Home",
  "category": "Property",
  "percentComplete": 0,
  "completed": false
}
```

---

#### `GET /goals`

**Response `data`:** Array of goal objects.

---

#### `GET /goals/analytics`

**Response `data`:**

```json
{
  "totalTarget": 115000,
  "totalSaved": 57200,
  "overallProgress": 50,
  "completedCount": 1,
  "goals": [ ]
}
```

---

#### `GET /goals/:id` · `PATCH /goals/:id` · `DELETE /goals/:id`

Same patterns as budgets. Updating `saved` to `>= target` marks goal completed and may trigger a notification.

---

### 7.7 Analytics

Base path: `/analytics` — **All protected**

Dashboard and chart data for the current user.

#### `GET /analytics/summary`

**Response `data`:**

```json
{
  "monthlyIncome": 12450,
  "monthlyExpenses": 8340,
  "monthlyNetChange": 4110,
  "totalBalance": 142502.8,
  "savingsYield": 4.2,
  "netWorth": 124592,
  "netWorthChange": 12.5
}
```

---

#### `GET /analytics/monthly`

Monthly income vs expenses.

**Query:** `months` (number, default `6`)

**Response `data`:**

```json
[
  { "name": "Jan", "income": 11200, "expenses": 7800 },
  { "name": "Feb", "income": 11800, "expenses": 8100 }
]
```

---

#### `GET /analytics/categories`

Spending breakdown for current month.

**Response `data`:**

```json
[
  { "name": "Housing", "value": 2100, "color": "#10b981" },
  { "name": "Food", "value": 680, "color": "#0ea5e9" }
]
```

---

#### `GET /analytics/trends`

**Response `data`:**

```json
{
  "cashFlow": [ { "name": "Jan", "income": 11200, "expenses": 7800 } ],
  "incomeVsExpenses": [
    { "name": "Jan", "income": 11200, "expenses": 7800, "net": 3400 }
  ]
}
```

---

#### `GET /analytics/savings`

**Response `data`:**

```json
[
  {
    "name": "New Home Fund",
    "saved": 24000,
    "target": 50000,
    "progress": 48
  }
]
```

---

### 7.8 Notifications

Base path: `/notifications` — **All protected**

#### `GET /notifications`

**Query:** `page`, `limit`, `search` (pagination)

**Response `data`:**

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Budget Alert",
      "message": "Transport category is over budget by $20",
      "time": "2m ago",
      "read": false,
      "type": "alert"
    }
  ],
  "meta": { "total": 3, "page": 1, "limit": 20, "totalPages": 1, "hasNext": false, "hasPrev": false }
}
```

---

#### `GET /notifications/unread-count`

**Response `data`:**

```json
{
  "count": 2
}
```

---

#### `PATCH /notifications/read-all`

Mark all notifications as read.

**Response `data`:**

```json
{
  "message": "All notifications marked as read"
}
```

---

#### `PATCH /notifications/:id/read`

Mark one notification as read.

---

### 7.9 AI Insights

Base path: `/ai-insights` — **All protected**

#### `GET /ai-insights`

Returns stored insights or generates new ones from spending patterns.

**Response `data`:**

```json
[
  {
    "id": "uuid",
    "title": "Subscription Alert",
    "description": "You have recurring subscriptions costing $47/mo.",
    "type": "subscription"
  }
]
```

---

#### `POST /ai-insights/generate`

Force regenerate insights (replaces analysis based on current data).

**Response `data`:** Same array shape as GET.

---

#### `DELETE /ai-insights/:id`

Dismiss (hide) an insight.

**Response `data`:**

```json
{
  "message": "Insight dismissed"
}
```

---

## 8. Frontend integration guide

### Step 1 — Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Step 2 — HTTP client (Axios example)

```typescript
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // REQUIRED for cookies
  headers: { "Content-Type": "application/json" },
});

// Unwrap { success, data, timestamp }
apiClient.interceptors.response.use((response) => {
  if (response.data?.data !== undefined) {
    response.data = response.data.data;
  }
  return response;
});
```

### Step 3 — Auto refresh on 401

```typescript
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      await apiClient.post("/auth/refresh");
      return apiClient(original);
    }
    return Promise.reject(error);
  }
);
```

### Step 4 — Auth service examples

```typescript
// Login
await apiClient.post("/auth/login", { email, password });

// Register
await apiClient.post("/auth/register", { firstName, lastName, email, password });

// Profile
const profile = await apiClient.get("/users/profile");

// Logout
await apiClient.post("/auth/logout");
```

### Step 5 — Map to UI types

| API | Frontend page |
|-----|----------------|
| `GET /analytics/summary` | Dashboard stats |
| `GET /transactions` | Expenses / transactions table |
| `GET /budgets` | Budgets page |
| `GET /goals` | Savings page |
| `GET /analytics/monthly` + `/trends` | Analytics charts |
| `GET /ai-insights` | AI insights card |
| `GET /notifications` | Navbar notifications |

### Step 6 — Google OAuth (optional)

Redirect user to:

```
GET {API_URL}/auth/google
```

Ensure `FRONTEND_URL` and Google console redirect URI match `GOOGLE_CALLBACK_URL`.

---

## 9. Swagger (interactive docs)

With the server running:

**URL:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

Use Swagger to try endpoints, view schemas, and export OpenAPI JSON.

---

## 10. Demo account

After `npm run prisma:seed`:

| Field | Value |
|-------|--------|
| Email | `demo@finova.app` |
| Password | `Password123!` |

Includes sample transactions, budgets, goals, notifications, and AI insights.

---

## Quick reference — all endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | Health check |
| POST | `/auth/register` | Public | Sign up |
| POST | `/auth/login` | Public | Sign in |
| POST | `/auth/logout` | Yes | Sign out |
| POST | `/auth/refresh` | Public | Refresh tokens |
| POST | `/auth/forgot-password` | Public | Request reset |
| POST | `/auth/reset-password` | Public | Reset password |
| GET | `/auth/verify-email` | Public | Verify email |
| GET | `/auth/google` | Public | OAuth start |
| GET | `/auth/google/callback` | Public | OAuth callback |
| GET | `/auth/me` | Yes | JWT payload |
| GET | `/users/profile` | Yes | Get profile |
| PATCH | `/users/profile` | Yes | Update profile |
| PATCH | `/users/notification-preferences` | Yes | Notification settings |
| POST | `/transactions` | Yes | Create transaction |
| GET | `/transactions` | Yes | List transactions |
| GET | `/transactions/categories` | Yes | List categories |
| GET | `/transactions/:id` | Yes | Get transaction |
| PATCH | `/transactions/:id` | Yes | Update transaction |
| DELETE | `/transactions/:id` | Yes | Delete transaction |
| POST | `/budgets` | Yes | Create budget |
| GET | `/budgets` | Yes | List budgets |
| GET | `/budgets/analytics` | Yes | Budget analytics |
| GET | `/budgets/:id` | Yes | Get budget |
| PATCH | `/budgets/:id` | Yes | Update budget |
| DELETE | `/budgets/:id` | Yes | Delete budget |
| POST | `/goals` | Yes | Create goal |
| GET | `/goals` | Yes | List goals |
| GET | `/goals/analytics` | Yes | Goals analytics |
| GET | `/goals/:id` | Yes | Get goal |
| PATCH | `/goals/:id` | Yes | Update goal |
| DELETE | `/goals/:id` | Yes | Delete goal |
| GET | `/analytics/summary` | Yes | Dashboard summary |
| GET | `/analytics/monthly` | Yes | Monthly chart data |
| GET | `/analytics/categories` | Yes | Category spending |
| GET | `/analytics/trends` | Yes | Cash flow trends |
| GET | `/analytics/savings` | Yes | Savings trends |
| GET | `/notifications` | Yes | List notifications |
| GET | `/notifications/unread-count` | Yes | Unread count |
| PATCH | `/notifications/read-all` | Yes | Mark all read |
| PATCH | `/notifications/:id/read` | Yes | Mark one read |
| GET | `/ai-insights` | Yes | Get insights |
| POST | `/ai-insights/generate` | Yes | Regenerate insights |
| DELETE | `/ai-insights/:id` | Yes | Dismiss insight |
| GET | `/currency/supported` | Public | 20 supported currencies (LKR, USD, …) |
| GET | `/currency/rates?base=USD` | Public | Live exchange rates (cached 1h) |
| POST | `/currency/convert` | Public | Convert amount between currencies |
| GET | `/currency/preferences` | Yes | User currency + rates for display |

### Currency module

Uses free **[Frankfurter API](https://www.frankfurter.app)** (no API key) with fallback to **open.er-api.com**.

**Supported currencies (20):** LKR, USD, EUR, GBP, INR, AUD, CAD, SGD, JPY, CNY, CHF, AED, SAR, PKR, BDT, THB, MYR, PHP, IDR, KRW

**Default user currency:** `LKR` (Sri Lankan Rupee)

All monetary API responses (transactions, budgets, goals, analytics) are converted to the user's profile `currency` field.

**POST /currency/convert** body:
```json
{ "amount": 100, "from": "USD", "to": "LKR" }
```

---

*Finova API v1.0 — NestJS backend for money-tracker frontend*
