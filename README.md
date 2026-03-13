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
- [ ] **3d**: Enhanced trainer notes and history 🔄

### Future Phases

**Communication & Hardware:**

- [ ] Video/Audio chat during live sessions (WebRTC evaluation)
- [ ] Live heart rate monitoring via Bluetooth chest strap

**Workout Management:**

- [ ] Round templates: Trainer can save round configurations and reuse them
- [ ] Pain intensity scale: Add 1-10 slider for each selected body region

**User Management:**

- [ ] Self-service user registration
- [ ] OAuth integration (Google/Apple)

**Analytics:**

- [ ] Advanced progress tracking and analytics
- [ ] Exercise performance trends over time
- [ ] Pain pattern analysis

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

1. **Feature planning**: Define requirements and user stories (Product Owner role)
2. **Specification**: Detailed briefing documents for AI-assisted implementation
3. **Implementation**: Build features using Claude Code (AI pair programming)
4. **Testing**: Manual testing + automated tests
5. **Review**: UI/UX review and business logic validation
6. **Commit**: Clear commit messages following conventional commits

**AI-Assisted Development:**

- Requirements and architecture defined with Claude (Anthropic)
- Implementation executed with Claude Code
- Product Owner review and iteration
- Learning focus: understanding high-level architecture and business logic

## 📄 License

Private project - All rights reserved

## 🔗 Links

- **Repository**: [github.com/dom-4242/workoutbro](https://github.com/dom-4242/workoutbro)
- **Local Dev**: [localhost:3000](http://localhost:3000)
- **Prisma Studio**: [localhost:5555](http://localhost:5555)

---

Built with ❤️ for effective athlete-trainer collaboration  
_Powered by curiosity, Claude AI, and a lot of learning_ 🚀
