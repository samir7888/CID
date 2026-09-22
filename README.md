# 🚔 C.I.D. — Chodu Investigation Department

> **The ultimate free 3D endless runner game** — Run from ACP Pradyuman through chaotic Indian streets, dodge obstacles, collect Pink Chuts, and unlock iconic CID characters. Playable entirely in your browser. No download needed.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-0.185-black?logo=three.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)
![Drizzle ORM](https://img.shields.io/badge/DrizzleORM-PostgreSQL-green)
![Clerk](https://img.shields.io/badge/Auth-Clerk-purple)

---

## 📖 Table of Contents

- [About the Game](#-about-the-game)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Game Features](#-game-features)
- [Controls](#-controls)
- [Scripts](#-scripts)

---

## 🎮 About the Game

**C.I.D. (Chodu Investigation Department)** is a fan-made, free-to-play 3D endless runner browser game inspired by India's legendary crime show *CID* on Sony Entertainment Television.

You play as a suspect fleeing the scene — but **ACP Pradyuman**, India's sharpest detective, is always hot on your trail. Navigate chaotic Indian streets lined with rickshaws, chai stalls, and unexpected obstacles. The further you run, the more intense the chase becomes!

**Key highlights:**
- 🌐 Runs entirely in the browser via **WebGL / Three.js** — no downloads, no installs
- 🆓 Free to play with optional **Pink Chuts** in-game currency
- 🏆 Global leaderboard — sign in to save your high score
- 📱 Full mobile touch-swipe support (Android & iOS)
- 🎭 Unlockable CID characters (Daya, and more coming soon)

> *Fan-made project. Not affiliated with Sony Entertainment Television.*

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | TypeScript 6 |
| **3D Engine** | [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei) |
| **Styling** | Tailwind CSS v4 |
| **Auth** | [Clerk](https://clerk.com/) |
| **Database** | PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/) |
| **Payments** | [Dodo Payments](https://dodopayments.com/) |
| **Audio** | [Howler.js](https://howlerjs.com/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Testing** | [Vitest](https://vitest.dev/) |
| **Analytics** | [Vercel Analytics](https://vercel.com/analytics) |

---

## 📁 Project Structure

```
cid/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing / home page
│   ├── layout.tsx              # Root layout
│   ├── game/                   # Game route & page
│   ├── login/                  # Clerk sign-in page
│   ├── sign-up/                # Clerk sign-up page
│   ├── pink-coins/             # In-game currency store
│   ├── success/                # Post-purchase success page
│   ├── failure/                # Post-purchase failure page
│   ├── character/              # Character selection page
│   └── api/                    # API route handlers (auth webhooks, payments, etc.)
│
├── components/
│   ├── game/                   # All 3D game components
│   │   ├── Game.tsx            # Main game loop & state
│   │   ├── Player.tsx          # Player character & animations
│   │   ├── Chaser.tsx          # ACP Pradyuman pursuer logic
│   │   ├── Environment.tsx     # Indian street environment
│   │   ├── GreenEnvironment.tsx# Green/park environment variant
│   │   ├── SceneManager.tsx    # Three.js scene orchestration
│   │   ├── Road.tsx            # Procedural road generation
│   │   ├── RoadChunk.tsx       # Chunked road segment
│   │   ├── Obstacle.tsx        # Obstacle placement & types
│   │   ├── Coin.tsx            # Pink Chut collectible
│   │   ├── GameUI.tsx          # HUD, score, and game over UI
│   │   ├── MobileControls.tsx  # Touch-swipe controls
│   │   └── AudioManager.ts     # Howler.js audio controller
│   ├── character/              # Character-related components
│   └── seo/                    # SEO utility components
│
├── lib/
│   ├── db/                     # Drizzle ORM schema, queries & migrations
│   ├── game/                   # Game logic utilities
│   └── payments/               # Dodo Payments integration
│
├── drizzle/                    # Drizzle migration files
├── scripts/                    # One-off utility scripts
├── public/                     # Static assets (fonts, sounds, images)
├── docker-compose.yml          # Local PostgreSQL via Docker
├── drizzle.config.ts           # Drizzle ORM config
└── next.config.js              # Next.js config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Docker** (for local PostgreSQL) or a remote PostgreSQL instance
- A [Clerk](https://clerk.com/) account
- *(Optional)* A [Dodo Payments](https://dodopayments.com/) account for the in-game store

### 1. Clone the repo

```bash
git clone https://github.com/your-username/cid.git
cd cid
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in the required values — see [Environment Variables](#-environment-variables) below.

### 4. Start the local database

```bash
docker compose up -d
```

### 5. Run migrations & seed

```bash
npm run db:migrate
npm run db:seed   # optional — seeds initial data
```

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the game runs at [http://localhost:3000/game](http://localhost:3000/game).

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# PostgreSQL connection string
DATABASE_URL=postgres://cid:cid@localhost:5432/cid

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/game
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/game

# Dodo Payments (optional — required for Pink Chuts store)
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_SECRET=
DODO_PAYMENTS_RETURN_URL=http://localhost:3000/success
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk public key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `CLERK_WEBHOOK_SIGNING_SECRET` | ✅ | Clerk webhook for user sync |
| `DODO_PAYMENTS_API_KEY` | ⚡ Optional | Enables the Pink Chuts store |
| `DODO_PAYMENTS_WEBHOOK_SECRET` | ⚡ Optional | Validates payment webhooks |

---

## 🗄 Database Setup

The project uses **Drizzle ORM** with **PostgreSQL**.

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Push schema directly (dev shortcut, no migration files)
npm run db:push

# Seed initial data
npm run db:seed

# Open Drizzle Studio (visual DB browser)
npm run db:studio
```

The local Docker PostgreSQL instance is pre-configured in `docker-compose.yml`:
- **Host:** `localhost:5432`
- **Database:** `cid`
- **User/Password:** `cid / cid`

---

## 🎮 Game Features

| Feature | Description |
|---|---|
| 🏃 **3D Endless Runner** | Powered by Three.js WebGL — no plugin required |
| 👮 **ACP Pradyuman Chaser** | Gets faster and more relentless the longer you survive |
| ◆ **Pink Chuts** | In-game currency — collect during runs or purchase |
| 🏆 **Global Leaderboard** | Sign in with Clerk to save scores and rank globally |
| 🎭 **Unlockable Characters** | Daya and more iconic CID cast members |
| 📱 **Mobile Ready** | Full swipe gesture support for touch devices |
| 🔊 **Audio** | Dynamic background music and SFX via Howler.js |
| 🌐 **No Download** | Runs fully in-browser on Chrome, Firefox, Edge, Safari |

---

## 🕹 Controls

| Input | Action |
|---|---|
| `←` / `→` Arrow Keys | Switch lanes |
| `↑` / `Space` | Jump |
| `↓` | Slide |
| 👆 Swipe Left / Right | Switch lanes (mobile) |
| 👆 Swipe Up | Jump (mobile) |
| 👆 Swipe Down | Slide (mobile) |

---

## 📜 Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest tests

npm run db:generate  # Generate Drizzle migration files
npm run db:migrate   # Apply migrations
npm run db:push      # Push schema (no migration files)
npm run db:seed      # Seed the database
npm run db:studio    # Open Drizzle Studio UI
```

---

<div align="center">
  <strong>C.I.D. Game</strong> — Fan-made. Not affiliated with Sony Entertainment Television.<br/>
  Made with ❤️ for fans of India's greatest detective show.
</div>
