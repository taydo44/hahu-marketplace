# 🛍️ Hahu Marketplace

A community services marketplace for the Ethiopian and East African diaspora across the United States.

**Tech stack:** Next.js 15 · TypeScript · Tailwind CSS · Supabase (Auth + DB + Storage)

---

## ⚡ Deploy in 4 Steps

### Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note your **Project URL** and **anon public key** (Settings → API)
3. Go to **SQL Editor → New Query**, paste the entire contents of  
   `supabase/migrations/001_initial_schema.sql`, then click **Run**
4. Go to **Authentication → URL Configuration** and set:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

---

### Step 2 — Local Setup

```bash
# Clone and install
npm install

# Create your env file
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ✅

---

### Step 3 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Hahu Marketplace"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/hahu-marketplace.git
git branch -M main
git push -u origin main
```

---

### Step 4 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your `hahu-marketplace` GitHub repo
3. Vercel auto-detects Next.js — just add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

4. Click **Deploy** 🚀

5. **After deploy**, update Supabase → Authentication → URL Configuration:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

## Project Structure

```
hahu-marketplace/
├── src/
│   ├── app/                     ← Pages (Next.js App Router)
│   │   ├── page.tsx             ← Homepage
│   │   ├── layout.tsx           ← Root layout
│   │   ├── globals.css          ← Tailwind + design system
│   │   ├── not-found.tsx        ← 404 page
│   │   ├── auth/
│   │   │   ├── login/           ← Sign in
│   │   │   ├── signup/          ← Create account
│   │   │   └── callback/        ← Email confirm redirect
│   │   ├── browse/              ← Search & browse listings
│   │   ├── dashboard/           ← Manage your listings
│   │   ├── profile/             ← Edit profile
│   │   ├── services/
│   │   │   ├── [id]/            ← Service detail + reviews
│   │   │   ├── new/             ← Create listing
│   │   │   └── edit/[id]/       ← Edit listing
│   │   └── provider/[id]/       ← Public provider profile
│   ├── components/
│   │   ├── layout/              ← Navbar, Footer
│   │   ├── services/            ← ServiceCard, ServiceForm, SearchBar, DashboardActions
│   │   └── reviews/             ← ReviewSection
│   ├── lib/supabase/            ← Browser + server clients
│   ├── middleware.ts            ← Auth route protection
│   └── types/index.ts           ← Types + constants
├── supabase/migrations/
│   └── 001_initial_schema.sql   ← Full DB schema — run this in Supabase
├── public/                      ← Static assets
├── .env.local.example           ← Copy → .env.local
└── package.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript check |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails — missing env vars | Ensure both `NEXT_PUBLIC_SUPABASE_*` vars are set in Vercel |
| Auth redirect fails after signup | Add your domain to Supabase Redirect URLs |
| "relation does not exist" DB error | Run the SQL migration in Supabase SQL Editor |
| Images not loading | Verify `*.supabase.co` is allowed in `next.config.ts` |
| Avatar upload fails | Check the `avatars` bucket is public in Supabase Storage |

---

*Hahu Marketplace — connecting our community, one service at a time.* 🇪🇹
