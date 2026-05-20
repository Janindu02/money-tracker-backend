What was connected
New API services
Service	Endpoints used
auth.service.ts
Login, register, logout, profile
transaction.service.ts
CRUD transactions
budget.service.ts
Budgets + analytics
goals.service.ts
Savings goals
analytics.service.ts
Dashboard stats & charts
notifications.service.ts
Navbar notifications
ai-insights.service.ts
AI insights cards
Pages now use live API data
Page	Data source
Dashboard
Summary, cash flow, categories, transactions, goals, insights
Expenses
Expense transactions + charts
Budgets
Budget categories + analytics
Savings
Goals + add funds
Analytics
Charts + AI insights
Profile
User profile from API
Settings
Save profile & preferences to API
Navbar
Real notifications + user + logout
Auth flow
Login / register → backend cookies → dashboard
Protected routes → AuthGuard checks session
Auth pages → GuestGuard redirects if already logged in
Auto token refresh on 401
New UI features
Add Transaction dialog (dashboard & expenses)
Add Budget / Create Goal buttons
Loading skeletons while data loads
Empty states when no transactions exist
How to run the full app
Terminal 1 — Database:

cd money-tracker-backend
docker compose up postgres -d
Terminal 2 — Backend:

cd money-tracker-backend
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
API: http://localhost:3001/api/v1
Swagger: http://localhost:3001/api/docs

Terminal 3 — Frontend:

cd money-tracker
npm run dev
App: http://localhost:3000

Frontend env (already in .env.local):

NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
Demo login
Email	Password
demo@finova.app
Password123!
After seeding, this account has sample transactions, budgets, goals, and notifications.

Test the integration
Open http://localhost:3000/login
Sign in with the demo account
Dashboard should show real stats from PostgreSQL
Add a transaction via Add Transaction
Check Expenses, Budgets, Savings, Analytics
Update profile in Settings → Save Changes
Sign out from the navbar menu
The landing page still uses static marketing content (pricing, FAQ); all dashboard features use the live API.