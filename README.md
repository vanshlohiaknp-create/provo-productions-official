# Provo – Proof-Based Hiring Platform

> "Hire Based on Real Work. Not Résumés."

A production-ready SaaS platform where students solve real-world challenges, earn verified certificates, and get hired based on proof — not resumes.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or bun

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start development server
npm run dev
```

Open `http://localhost:5173`

---

## 📁 Project Structure

```
provo/
├── index.html                   # SEO-optimized entry point
├── src/
│   ├── App.tsx                  # Router with protected routes
│   ├── main.tsx                 # React root
│   ├── index.css                # Design system + Tailwind
│   │
│   ├── types/index.ts           # All TypeScript types
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx      # Auth state + localStorage
│   │
│   ├── data/
│   │   ├── mcq.ts               # 60 MCQ questions (3 categories)
│   │   └── sampleData.ts        # Sample challenges + pricing plans
│   │
│   ├── lib/
│   │   ├── razorpay.ts          # Razorpay integration (demo + live)
│   │   └── utils.ts             # Helpers
│   │
│   ├── hooks/
│   │   └── useRazorpay.ts       # Payment hook
│   │
│   ├── components/
│   │   ├── ui/index.tsx         # Button, Badge, Card, Input, EmptyState…
│   │   ├── layout/
│   │   │   ├── Navbar.tsx       # Responsive navbar
│   │   │   └── Footer.tsx       # Footer with founder info
│   │   ├── challenges/
│   │   │   └── ChallengeCard.tsx
│   │   ├── certificate/
│   │   │   └── CertificatePreview.tsx  # Full + compact modes
│   │   └── chatbot/
│   │       └── ProvoAssistant.tsx      # Role-aware chatbot
│   │
│   └── pages/
│       ├── Index.tsx            # Landing (hero, features, pricing)
│       ├── Auth.tsx             # Login + Signup
│       ├── Welcome.tsx          # Post-login welcome screen
│       ├── Challenges.tsx       # List, Detail, Submit, Create
│       ├── MCQ.tsx              # Select, Test, Results
│       ├── Dashboards.tsx       # Student, Business, Faculty, Admin
│       └── Pages.tsx            # Leaderboard, Opportunities, Profile, etc.
│
├── .env.example                 # Environment variables template
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 💳 Razorpay Payment Integration

### Demo Mode (default)
No real payment. Simulates a successful transaction.

### Live Mode
1. Get test keys from [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Add to `.env`:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```
3. In `src/hooks/useRazorpay.ts`, replace `demoPayment` with `initiateRazorpayPayment`

---

## 🗄️ Supabase Integration (Live Build)

To connect real data:

1. Create a [Supabase](https://supabase.com) project
2. Create tables: `profiles`, `challenges`, `submissions`, `certificates`, `notifications`
3. Add to `.env`:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
4. Replace `AuthContext` mock functions with Supabase auth calls
5. Replace data fetching with Supabase queries

---

## 🧠 MCQ Module

- **60 questions** across 3 categories:
  - Business & Management
  - Digital Marketing  
  - Finance & Economics
- Timer: 20 / 30 / 60 minutes
- Auto-submit on timeout
- Results: score, accuracy %, weak areas, certificate for 70%+

---

## 🤖 Provo Assistant (Chatbot)

- Visible only on authenticated dashboard pages
- Role-aware quick questions (Student / Business / Faculty / Admin)
- 16 predefined answers covering all common queries
- No fake AI — only honest, helpful answers

---

## 🚀 Deploy to GitHub Pages

```bash
# 1. Build
npm run build

# 2. Install gh-pages
npm install -g gh-pages

# 3. Deploy
gh-pages -d dist
```

Or use Vercel/Netlify:
```bash
# Vercel (one command)
npx vercel --prod
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Heading font | Playfair Display |
| Body font | Inter |
| Primary | `#4f7ef8` |
| Accent | `#0fb878` |
| Gold | `#c9a052` |
| Max width | 1160px |
| Border radius | 12px |

---

## 👤 Founder

**Vansh Lohia**  
vansh.lohiaknp@gmail.com  
BBA/MBA · Allenhouse Group · CSJMU, Kanpur

---

## 📄 License

MIT © 2025 Provo / VL Ventures
