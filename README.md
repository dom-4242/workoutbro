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

### Phase 3: Exercise Management & Live Training 🚧

- [x] **3a**: Exercise library with custom fields and video upload ✅
- [x] **3b**: Training session flow (without real-time) ✅ **(Currently in testing)**
  - Session start by athlete
  - Trainer joins and creates rounds
  - Round-by-round workflow
  - Exercise execution with video loops
  - Athlete feedback (difficulty + pain regions via SVG body selector)
  - Training history
- [ ] **3c**: Real-time trainer-athlete collaboration (Pusher) 🔄
- [ ] **3d**: Trainer notes and training history enhancements 🔄

### Future Phases

- [ ] Video/Audio chat during live sessions (WebRTC evaluation)
- [ ] Live heart rate monitoring via Bluetooth chest strap
- [ ] Self-service user registration
- [ ] OAuth integration (Google/Apple)
- [ ] Advanced analytics and progress tracking

## 🛠 Tech Stack

**Frontend:**

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (data visualization)
- next-intl (i18n)
- SVG components (custom body region selector)

**Backend:**

- Next.js API Routes & Server Actions
- NextAuth.js v5 (authentication)
- Prisma 6 (ORM)
- PostgreSQL 16

**Testing:**

- Vitest (unit tests)
- Playwright (E2E tests)
- 27 tests (13 unit + 14 E2E)

**Deployment:**

- Docker (development & production)
- Planned: Self-hosted on HomeLab

## 🔮 Planned Technical Features

### Real-time Communication

- **Pusher/Ably**: Live workout session updates between trainer and athlete
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
│   │   │   └── Exercise*.tsx             # Exercise management
│   │   └── layout/             # Layout components
│   ├── lib/
│   │   ├── actions/            # Server Actions
│   │   │   ├── admin.ts        # Admin operations
│   │   │   ├── exercise.ts     # Exercise CRUD
│   │   │   ├── session.ts      # Training sessions
│   │   │   └── weight.ts       # Weight tracking
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

- 13 unit tests (weight validation, user validation)
- 14 E2E tests (auth, admin access, weight tracking)

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
- TrainingSession (WAITING/ACTIVE/COMPLETED)
- SessionRound (DRAFT/RELEASED/ACTIVE/COMPLETED)
- RoundExercise (with planned values + athlete feedback)

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
