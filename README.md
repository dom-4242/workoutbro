# WorkoutBro 💪

Personal health dashboard for sharing fitness data between athlete and trainer.

> **⚠️ Disclaimer**: This is a personal **VIBE coding project** to explore modern web development and AI-assisted coding workflows. I am a **Product Owner**, not a senior web developer. This project is a learning journey using Claude (Anthropic) and Claude Code for implementation. The goal is to gain hands-on experience with full-stack development while building a real-world application. **100% transparency** — I'm learning as I build! 🚀

## 🎯 Vision

A web application that enables real-time collaboration between athletes and trainers during workout sessions. Athletes track their progress, trainers guide workouts remotely, and both have full visibility into training history and metrics.

## 👥 Target Users

- **Athletes**: German-speaking, primarily using iPad during training
- **Trainers**: Portuguese-speaking, using desktop/smartphone for remote coaching
- **Admins**: Manage users, exercises, and system configuration

## ✨ Features

### Phase 1: Foundation ✅

- [x] Multi-language support (DE/PT/EN)
- [x] Authentication with role-based access (ATHLETE, TRAINER, ADMIN)
- [x] Weight tracking with date/time and visual charts
- [x] Admin panel for user management
- [x] Trainer-athlete assignment system
- [x] Trainer dashboard with athlete overview
- [x] Testing infrastructure (Vitest + Playwright)

### Phase 2: Trainer Dashboard ✅

- [x] Trainers can view assigned athletes
- [x] Read-only access to athlete metrics
- [x] Trainer-athlete relationship (1:n)

### Phase 3: Exercise Management & Live Training ✅

- [x] **3a**: Exercise library with custom fields and video upload
  - Admin can create exercises with categories
  - Configurable required fields (weight, reps, distance, time, RPE, notes)
  - Video upload for exercise demonstrations (MP4/MOV)
  - Custom categories supported
- [x] **3b**: Training session flow (without real-time)
  - Session lifecycle: WAITING → ACTIVE → COMPLETED
  - Round-by-round workflow with DRAFT/RELEASED states
  - Trainer plans and releases rounds sequentially
  - Athlete executes exercises with video loop playback
  - Mandatory feedback system:
    - Perceived exertion rating via Borg CR-10 scale (0–10 slider, mandatory)
    - Pain reporting via interactive SVG body selector (15 regions, optional)
    - Optional notes per exercise
  - Session completion marking (final round indicator)
  - Session cancellation for both parties
  - Training history with completed sessions
  - Session URL persistence across page refreshes
- [x] **3c**: Real-time trainer-athlete collaboration ✅ **NEW**
  - Pusher Channels integration for instant updates
  - Automatic page updates without manual refresh (~1.1s delay)
  - Events: Round saved, released, completed, deleted, session completed/cancelled
  - Bidirectional real-time sync (Trainer ↔ Athlete)
  - Optimized delays for production (800ms server + 300ms client)
  - Works in both development and production builds
### 📋 Feature Backlog

> Full backlog is tracked in [GitHub Projects](https://github.com/users/dom-4242/projects/1) · Each item = one GitHub Issue

**Priority legend:** 🔴 P1 Now · 🟠 P2 Soon · 🟡 P3 Mid-term · 🟢 P4 Long-term · ⚪ P5 Future Vision

**A – DevOps & Developer Experience**

- 🔴 App versioning with SemVer (package.json + UI footer display)
- 🟠 CI/CD pipeline (automated tests on push/PR)
- 🟡 HomeLab production deployment (Docker, docker-compose.prod.yml)
- ⚪ New HomeLab server hardware (hardware investment)

**B – User Management & Profile**

- 🔴 Change password function for users
- 🔴 Language selection per user (stored preference in DB)
- 🟡 Mobile number in user profile
- 🟡 Self-service user registration
- 🟡 OAuth integration (Google/Apple)

**C – Internationalization**

- 🔴 Complete DE/PT/EN translations for all existing UI elements

**D – Session & Training Features**

- 🔴 Trainer can add notes to an active session
- 🔴 Session history for trainer (past sessions, athlete feedback, notes overview)
- 🟠 Per-athlete journal for trainer (general training notes, anytime)
- 🟠 Session templates (trainer saves and reuses round configurations)
- 🟠 Rest blocks between rounds/exercises (countdown timer for athlete, auto-start next)
- 🟠 Session timeline tracking (round/exercise timing visible for trainer and athlete)
- 🟠 Smarter variable values per exercise (reps/weight with intensity indicator based on past feedback)

**E – UI / UX**

- 🟡 Improved body model for pain region selection (more detailed SVG or 3D)

**F – Communication**

- 🟢 In-app text chat between trainer and athlete with built-in AI translation (DE ↔ PT)
- 🟢 Live video and audio chat during training (WebRTC – primary goal: audio + trainer sees athlete)
- 🟢 Shared training calendar for scheduling sessions
- 🟢 WhatsApp notifications (training reminders, session start)

**G – Hardware Integration**

- 🟢 Live heart rate from Polar H10 (Web Bluetooth API, live display + HR timeline over rounds)
- ⚪ Apple Watch trigger for manual round/exercise transitions

**H – External Services**

- 🟢 External exercise database via API (use external + custom exercises, video/GIF per exercise)

## 🛠 Tech Stack

**Frontend:**

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Recharts (data visualization)
- next-intl (i18n)
- Pusher Channels (real-time events)
- Custom SVG components (body region selector)

**Backend:**

- Next.js API Routes & Server Actions
- NextAuth.js v5 (authentication)
- Prisma 6 (ORM)
- PostgreSQL 16

**Testing:**

- Vitest (unit tests)
- Playwright (E2E tests)
- 111 tests (63 unit + 48 E2E)

**Deployment:**

- Docker (development & production)
- Planned: Self-hosted on HomeLab

## 🔮 Planned Technical Features

### Real-time Communication

- **Pusher Channels** ✅: Live workout session updates between trainer and athlete
  - Instant round release notifications
  - Automatic UI updates when rounds are saved/completed
  - Session state synchronization
  - Free tier: 100 concurrent connections, 200k messages/day
- **WebRTC** (evaluation phase): Video/audio chat during sessions

### Hardware Integration

- **Web Bluetooth API**: Direct connection to Bluetooth Low Energy (BLE) heart rate monitors
- **Supported devices**: ANT+ and Bluetooth chest straps (Polar H10, Garmin HRM-Dual, etc.)
- **Real-time HR tracking**: Live heart rate display during workout sessions
- **Browser compatibility**: Chrome/Edge (full support), Firefox/Safari (limited)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (installed via nvm)
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**

```bash
git clone git@github.com:dom-4242/workoutbro.git
cd workoutbro
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment**

```bash
cp .env.example .env
# Edit .env with your values
```

4. **Start database**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. **Run migrations and seed**

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

6. **Start development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Required environment variables in `.env`:

**Database:**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/workoutbro"
```

**Authentication (NextAuth.js v5):**

```bash
AUTH_SECRET="your-secret-key-here"
AUTH_TRUST_HOST=true  # Required for production
```

**Pusher (Real-time Updates):**

```bash
# Get these from https://dashboard.pusher.com
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"  # or your cluster
PUSHER_APP_ID="your-app-id"
PUSHER_SECRET="your-pusher-secret"
```

See `.env.example` for full template.

### Test Credentials

After seeding, you can login with:

- **Athlete**: Check `prisma/seed.ts` for credentials
- **Trainer**: Check `prisma/seed.ts` for credentials

## 📁 Project Structure

```
workoutbro/
├── src/
│   ├── app/                    # Next.js pages & routing
│   │   ├── (auth)/login/       # Authentication
│   │   ├── dashboard/          # User dashboards
│   │   │   └── session/        # Training sessions (Phase 3b)
│   │   ├── admin/              # Admin panel
│   │   │   ├── users/          # User management
│   │   │   └── exercises/      # Exercise library
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── BodyRegionSelector.tsx    # SVG pain region selector
│   │   │   ├── WeightChart.tsx           # Recharts weight chart
│   │   │   ├── FeedbackForm.tsx          # Exercise feedback
│   │   │   ├── RoundPlanner.tsx          # Round creation/editing
│   │   │   ├── SessionPusherSubscriber.tsx # Real-time events
│   │   │   └── Exercise*.tsx             # Exercise management
│   │   └── layout/             # Layout components
│   ├── lib/
│   │   ├── actions/            # Server Actions
│   │   │   ├── admin.ts        # Admin operations
│   │   │   ├── exercise.ts     # Exercise CRUD
│   │   │   ├── session.ts      # Training sessions
│   │   │   └── weight.ts       # Weight tracking
│   │   ├── cr10.ts             # Borg CR-10 scale utilities
│   │   ├── pusher.ts           # Pusher server instance
│   │   ├── pusher-client.ts    # Pusher client instance
│   │   ├── pusher-events.ts    # Event constants & types
│   │   ├── auth.ts             # NextAuth config
│   │   └── prisma.ts           # Prisma client
│   ├── tests/
│   │   ├── unit/               # Unit tests (Vitest)
│   │   └── e2e/                # E2E tests (Playwright)
│   └── i18n/                   # Internationalization
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── seed.ts                 # Test data
├── messages/                   # Translation files
│   ├── de.json
│   ├── pt.json
│   └── en.json
├── public/
│   └── exercise-videos/        # Uploaded exercise videos
└── docker-compose.dev.yml      # Local PostgreSQL
```

## 🧪 Testing

```bash
# Unit tests (Vitest)
npm run test

# E2E tests (Playwright)
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

**Current test coverage:**

- 63 unit tests (weight validation, user validation, CR-10 scale, utility functions, Pusher events)
- 48 E2E tests (auth, admin access, weight tracking, session flow, feedback system)

## 🗄 Database

```bash
# View database in browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

**Current schema:**

- User (with multi-role support)
- UserRole (ATHLETE, TRAINER, ADMIN)
- WeightEntry (with date/time)
- Exercise (with custom fields + video)
- TrainingSession (WAITING/ACTIVE/COMPLETED/CANCELLED)
- SessionRound (DRAFT/RELEASED/ACTIVE/COMPLETED + isFinalRound flag)
- RoundExercise (with planned values + athlete feedback)

**Real-time events (Pusher):**

- Channel pattern: `session-{sessionId}`
- Events: ROUND_RELEASED, ROUND_UPDATED, ROUND_SAVED, ROUND_COMPLETED, ROUND_DELETED, SESSION_COMPLETED, SESSION_CANCELLED

## 🔐 Security

- All routes protected by NextAuth middleware
- Role-based access control (RBAC)
- Server Actions with admin verification
- Defense in depth (middleware + action-level checks)
- Password hashing with bcryptjs (12 rounds)
- Environment variables for secrets
- Test credentials isolated in .env (never committed)

## 🌍 Internationalization

Supported languages:

- 🇩🇪 German (default for athletes)
- 🇵🇹 Portuguese (default for trainers)
- 🇬🇧 English (fallback)

Translation files in `messages/` directory.

## 📱 Responsive Design

Optimized for:

- 📱 Mobile (iPhone/Android)
- 📱 iPad (primary athlete device during training)
- 💻 Desktop (primary trainer device)

Tailwind breakpoints:

- `sm:` 640px+ (phone landscape)
- `md:` 768px+ (tablet)
- `lg:` 1024px+ (laptop)
- `xl:` 1280px+ (desktop)

Touch-friendly:

- Minimum 44px tap targets
- SVG body selector optimized for iPad touch input
- Interactive body silhouette with 15 clickable regions

## 🤝 Contributing

This is a personal learning project. Feedback and suggestions are welcome via Issues, but please understand this is primarily for educational purposes.

## 📝 Development Workflow

> Vibe Coding workflow with Claude Code (AI pair programming). Features are tracked as GitHub Issues in [GitHub Projects](https://github.com/users/dom-4242/projects/1).

### Cycle: Plan → Do → Test → Close → Push

**1. Plan**
- Pick the next feature from the backlog (GitHub Issue)
- Discuss the feature with Claude Code, clarify requirements
- Claude Code enters Plan Mode, proposes a technical solution
- Large features are split into sub-tasks / stories, each its own commit

**2. Do**
- Claude Code implements the feature
- Unit tests and E2E tests are written alongside the implementation
- Claude Code iterates until all tests are green
- TypeScript build must pass: `npm run build`
- Claude Code commits locally (no push yet)

**3. Test**
- Manual testing by the Product Owner on the running app (`npm run dev`)
- Feedback is given to Claude Code, further iterations until fully satisfying

**4. Approve**
- Product Owner gives explicit approval in chat

**5. Close & Push**
- Claude Code closes the GitHub Issue and moves it to "Done" on the board
- Claude Code pushes to `main`
- README is updated if needed

### Definition of Done

A feature is **done** when all of the following are true:
- [ ] `npm run test` — unit tests green
- [ ] `npm run test:e2e` — E2E tests green
- [ ] `npm run build` — TypeScript build clean
- [ ] Manual test by PO passed
- [ ] README updated
- [ ] Commit with conventional commit message on `main`

### New Feature Ideas

New features and ideas are submitted as GitHub Issues and added to the backlog for prioritization.

### AI-Assisted Development

- Requirements and architecture defined with Claude (Anthropic)
- Implementation executed with Claude Code (Plan Mode + worktrees)
- Product Owner review and iteration every cycle
- Learning focus: full-stack architecture and business logic

## 📄 License

Private project - All rights reserved

## 🔗 Links

- **Repository**: [github.com/dom-4242/workoutbro](https://github.com/dom-4242/workoutbro)
- **Local Dev**: [localhost:3000](http://localhost:3000)
- **Prisma Studio**: [localhost:5555](http://localhost:5555)

---

Built with ❤️ for effective athlete-trainer collaboration  
_Powered by curiosity, Claude AI, and a lot of learning_ 🚀
