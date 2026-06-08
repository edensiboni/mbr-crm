# 🔧 M.B.R — Mac Book Repair

A modern, production-ready CRM and management system for a MacBook repair engineering business.

## What's Inside

### Engineer Dashboard
- **Case Management** — Create and track every repair with full customer details, device info, issue descriptions, physical condition, diagnostic & repair notes, and parts used
- **Customer Directory** — Auto-built from cases; searchable customer profiles with contact info and repair history
- **Status Workflow** — Move cases through: Intake → Diagnosing → Awaiting Parts → In Repair → Testing → Ready → Completed
- **Priority Levels** — Low / Normal / High / Urgent tagging on every case
- **Financials** — Estimated cost, deposit paid, and final cost tracking per case
- **Communication Log** — Log every phone call, SMS, email, WhatsApp, or in-person interaction per case
- **Internal Notes** — Timestamped private notes per case
- **AI Agent** — Claude-powered chat that reads all your cases in real-time and answers any question about your repairs *(see API key setup below)*

### Access
- Engineer-only login page (no public customer portal)
- Default credentials: `engineer` / `mbr2025`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma ORM |
| AI Agent | Anthropic Claude API |

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up the database
```bash
npx prisma db push
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
```

> ⚠️ **AI Agent Note:** The AI Agent tab requires a valid Anthropic API key.
> Without it, the agent will respond with a connection error.
> Get your key at [console.anthropic.com](https://console.anthropic.com) and add it to `.env`, then restart the dev server.

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── page.tsx                    # Engineer login page
├── dashboard/
│   ├── layout.tsx              # Sidebar navigation
│   ├── page.tsx                # Overview / stats
│   ├── cases/
│   │   ├── page.tsx            # Cases list with filters
│   │   ├── new/page.tsx        # New case form
│   │   └── [id]/page.tsx       # Case detail & editing
│   ├── customers/page.tsx      # Customer directory
│   ├── agent/page.tsx          # AI agent chat
│   └── settings/page.tsx       # Settings & credentials
├── api/
│   ├── cases/route.ts          # GET all, POST new case
│   ├── cases/[id]/route.ts     # GET, PATCH, DELETE case
│   ├── cases/[id]/notes/       # POST note to case
│   ├── cases/[id]/communications/ # POST comm log entry
│   ├── customers/route.ts      # GET all, POST customer
│   ├── customers/[id]/route.ts # GET, PATCH, DELETE customer
│   └── agent/route.ts          # AI agent endpoint
prisma/
│   └── schema.prisma           # DB schema (Customer, Case, Note, Communication)
lib/
│   ├── db.ts                   # Prisma client singleton
│   └── utils.ts                # Helpers, constants, label maps
```

## Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npx prisma studio    # Browse database in browser
npx prisma db push   # Sync schema to database
```

---

Built with [Next.js](https://nextjs.org) · Powered by [Claude](https://anthropic.com)
