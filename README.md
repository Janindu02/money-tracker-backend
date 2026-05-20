# Finova Backend API

Production-ready NestJS backend for the Finova money management app.

## Stack

- NestJS 11 + TypeScript
- PostgreSQL + Prisma ORM
- JWT + HttpOnly cookies + refresh tokens
- Swagger at `/api/docs`
- Docker Compose for PostgreSQL

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up postgres -d
```

### 2. Configure environment

Copy `.env.example` to `.env` and update secrets if needed.

### 3. Run migrations and seed

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 4. Start API

```bash
npm run start:dev
```

API: `http://localhost:3001/api/v1`  
Swagger: `http://localhost:3001/api/docs`

## Demo account

After seeding:

- **Email:** `demo@finova.app`
- **Password:** `Password123!`

## Frontend connection

In the Next.js app (`money-tracker`), create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Google sign-in (optional)

1. Open [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Credentials** → **Create OAuth client ID** (Web application).
2. **Authorized JavaScript origins:** `http://localhost:3000` (your frontend URL).
3. **Authorized redirect URIs:** `http://localhost:3001/api/v1/auth/google/callback` (must match `GOOGLE_CALLBACK_URL` in `.env`).
4. Copy **Client ID** and **Client secret** into backend `.env`:

```
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/v1/auth/google/callback"
```

5. Restart the API. The login page shows **Continue with Google** when credentials are configured (`GET /auth/providers`).

## Auth security

- Passwords: bcrypt (12 rounds), minimum strength rules on register/reset
- Tokens: short-lived JWT access token + rotating refresh token in HttpOnly cookies
- Rate limits: stricter throttling on login, register, and password reset
- Brute-force protection: temporary lockout after repeated failed logins
- Sessions: stored in DB with IP/user-agent metadata; max 10 active sessions per user
- Google OAuth: CSRF `state` parameter; callback sets cookies then redirects to frontend `/auth/callback`

## API modules

| Module | Prefix | Description |
|--------|--------|-------------|
| Auth | `/auth` | Register, login, logout, refresh, forgot/reset password, Google OAuth |
| Users | `/users` | Profile, preferences |
| Transactions | `/transactions` | CRUD, filters, categories |
| Budgets | `/budgets` | Monthly budgets, alerts, analytics |
| Goals | `/goals` | Savings goals, progress |
| Analytics | `/analytics` | Summaries, trends, charts data |
| Notifications | `/notifications` | Alerts, read status |
| AI Insights | `/ai-insights` | Spending analysis, recommendations |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:seed` | Seed demo data |
| `npm run db:setup` | Migrate + seed |
