# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready mobile-first multiplication flash cards web application built with **React 18**, **TypeScript 5** (strict mode), **Tailwind CSS v4**, and **Vite 6**. Uses browser localStorage for all data persistence. Targets children ages 8-12 with intelligent adaptive learning based on past performance.

**Status**: Production ready - 241/241 tests passing, 0 TypeScript errors, 0 lint warnings.

## Development Commands

```bash
# Package manager: pnpm (required)
pnpm install

# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build (outputs to dist/)
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once (CI mode)
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage report

# Code Quality
pnpm type-check       # TypeScript validation (no emit)
pnpm lint             # ESLint validation

# Utilities
pnpm demo             # Run weighted randomization demo (tsx src/algorithms/demo.ts)
pnpm generate-icons   # Generate PWA icons from SVG (requires sharp)
```

## Technology Stack

- **Build Tool**: Vite 6 with @vitejs/plugin-react
- **Styling**: Tailwind CSS v4 with @tailwindcss/vite plugin
- **Router**: React Router DOM 6.28
- **Charts**: Recharts 2.13
- **Icons**: Lucide React
- **Testing**: Vitest 3.2 with Happy-DOM environment
- **E2E Testing**: Playwright (installed, configuration needed)
- **PWA**: vite-plugin-pwa (configured in vite.config.ts)

## Architecture Overview

### Project Structure
```
src/
├── algorithms/       # Weighted randomization & max binary heap
│   ├── heap.ts              # Max heap implementation
│   ├── weightedRandom.ts    # Adaptive problem generation
│   ├── sessionScorer.ts     # Session scoring logic
│   └── *.test.ts            # Algorithm tests (43 + 32 + 39 tests)
├── components/       # 12 reusable UI components (1099 lines)
│   ├── Button.tsx, Input.tsx, Modal.tsx
│   ├── NumberPad.tsx        # Touch-friendly number input
│   ├── Timer.tsx, ProgressBar.tsx, ProgressRing.tsx
│   ├── ConfettiOverlay.tsx  # Celebration animations
│   └── index.ts             # Barrel exports
├── context/          # React Context for global state
│   ├── AppContext.tsx       # Provider with currentUser, settings
│   ├── createAppContext.ts  # Context factory
│   └── useApp.ts            # Context hook
├── hooks/            # Custom React hooks (949 lines)
│   ├── useLocalStorage.ts   # Generic localStorage with sync
│   ├── useTimer.ts          # Countdown timer with controls
│   ├── useSession.ts        # Session state management
│   ├── useKeyboard.ts       # Keyboard input handling
│   └── useSound.ts          # Web Audio API integration
├── lib/              # Utility modules (1329 lines)
│   ├── dateUtils.ts         # 19 date/time functions
│   ├── validation.ts        # 8 validation functions
│   ├── calculations.ts      # 13 statistics functions
│   └── formatters.ts        # 15 formatting functions
├── pages/            # 6 route pages (1336 lines)
│   ├── SplashPage.tsx       # Landing: Settings/Users buttons
│   ├── UsersPage.tsx        # User management
│   ├── SettingsPage.tsx     # Configuration
│   ├── SessionPage.tsx      # Flash card session
│   ├── SessionEndPage.tsx   # Results & celebration
│   └── ReportsPage.tsx      # Analytics with charts
├── storage/          # Local storage abstraction (1071 lines)
│   ├── index.ts             # CRUD, validation, migrations
│   └── storage.test.ts      # 102 comprehensive tests
├── types/            # TypeScript definitions
│   └── index.ts             # User, Settings, Session, Card types
└── __tests__/
    ├── integration.test.tsx # 25 integration tests
    └── e2e-manual.md        # Manual testing guide (70+ scenarios)
```

### Routing Structure
- `/` - Splash page (entry point)
- `/users` - User selection/creation
- `/settings` - App configuration
- `/session/:userId` - Flash card session
- `/session-end` - Session results
- `/reports/:userId` - User analytics

### State Management
- **Global State**: React Context (AppContext) provides:
  - `currentUser`: Currently selected user
  - `settings`: App settings (numbers, session length, time limit)
  - `setCurrentUser()`, `setSettings()`, `isLoading`
- **Session State**: useSession hook manages current session
- **Local State**: Component-level useState for UI state

## Core Features

### Weighted Randomization Algorithm
The application's key feature is intelligent problem generation in `src/algorithms/weightedRandom.ts`:

1. **Analyze past performance**: Fetches last 3 sessions for user
2. **Build frequency map**: Counts how often each number (1-12) appears in wrong answers
3. **Weighted selection**: Uses weighted random sampling where:
   - Numbers with higher wrong answer frequency appear more often
   - Weight = frequency + 1 (ensures 0-frequency numbers still have small chance)
   - operand1 selected from user's includedNumbers (settings)
   - operand2 selected from full range 1-12, weighted by past errors
4. **Fallback**: Pure random if no wrong answers in past 3 sessions
5. **Uniqueness**: Ensures no duplicate problems within a session
6. **Shuffle**: Fisher-Yates shuffle for final problem order

### Storage Layer (src/storage/index.ts)
Production-grade localStorage abstraction with:
- **Type-safe CRUD**: Users, Settings, Sessions
- **Validation**: Type guards for all stored data
- **Error handling**: Quota exceeded, corrupted data, security errors
- **Multi-tab sync**: Storage event listeners
- **Atomic transactions**: All-or-nothing operations
- **Schema migrations**: Versioned schema with migration runner
- **Export/import**: JSON data backup/restore
- **Default fallbacks**: Graceful degradation on corruption

Key functions:
- `getUsers()`, `createUser()`, `updateUser()`, `deleteUser()`
- `getSettings()`, `updateSettings()`, `resetSettings()`
- `getSessions()`, `getLastNSessions()`, `createSession()`, `updateSession()`
- `getCurrentSession()` - for in-progress session recovery
- `clearAllData()`, `exportData()`, `importData()`
- `initializeStorage()` - run on app startup to migrate schema

### Session Management (src/hooks/useSession.ts)
The `useSession` hook provides:
- **Problem generation**: Uses weighted randomization
- **Auto-save**: Saves after each answer
- **Progress tracking**: Current card index, percentage complete
- **Score calculation**: Real-time correct/total
- **Completion detection**: Triggers onComplete callback
- **Timeout handling**: Triggers onTimeout callback
- **Recovery**: Loads in-progress sessions on mount

### Data Model

#### User
```typescript
{
  id: string;           // Generated: timestamp_random
  name: string;         // 1-100 chars, validated
  createdAt: number;    // Unix timestamp
}
```

#### Settings
```typescript
{
  includedNumbers: number[];  // Subset of 1-12
  cardsPerSession: number;    // 1-100
  timeLimit: number;          // Seconds (1-3600)
}
```

#### Session
```typescript
{
  userId: string;
  sessionId: string;
  timestamp: number;
  cards: Card[];
  score: number;              // Count of correct answers
  totalCards: number;
  finishTime?: number;        // Seconds to complete (if not timed out)
  timedOut: boolean;
}
```

#### Card
```typescript
{
  problem: string;            // e.g., "6×7"
  operand1: number;           // 1-12
  operand2: number;           // 1-12
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}
```

## TypeScript Configuration

- **Strict Mode**: Enabled with noUncheckedIndexedAccess
- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **Path Aliases**: `@/*` maps to `./src/*`
- **No implicit returns**: Enforced
- **Unused locals/params**: Error
- **Force consistent casing**: Enforced

## Testing Strategy

### Unit Tests (Vitest)
- **Storage tests**: 102 tests covering all CRUD, validation, edge cases
- **Heap tests**: 43 tests for max binary heap implementation
- **Weighted random tests**: 32 tests for problem generation
- **Session scorer tests**: 39 tests for score calculations
- **Integration tests**: 25 tests for component interactions

Run with `pnpm test` (watch) or `pnpm test:run` (CI).

### E2E Tests
- **Playwright installed**: Ready for E2E test authoring
- **Manual test guide**: `src/__tests__/e2e-manual.md` (70+ scenarios)
- **No automated E2E yet**: Requires playwright.config.ts setup

### Coverage
Run `pnpm test:coverage` for detailed coverage report.

## Component Library

12 production-ready components in `src/components/`:

1. **Button** - 3 variants (primary/secondary/ghost), loading states, disabled
2. **Input** - Error handling, validation, labels
3. **Card** - Container with shadow, padding, variants
4. **Modal** - Full-screen overlay, focus trap, close on backdrop
5. **Timer** - Linear/circular variants, countdown display
6. **NumberPad** - Touch-friendly 0-9 grid (64px touch targets)
7. **ScoreDisplay** - Animated score with visual feedback
8. **LoadingSpinner** - Kid-friendly animation
9. **ProgressBar** - Linear progress indicator
10. **ProgressRing** - Circular progress indicator
11. **ConfettiOverlay** - Celebration animation (session complete)
12. **ErrorBoundary** - Crash recovery with reset

All components are mobile-first, accessible (ARIA), and kid-friendly.

## Styling Conventions

### Tailwind CSS v4
- Using new v4 syntax with @tailwindcss/vite
- Mobile-first breakpoints
- Custom theme extensions in `tailwind.config.ts`
- Touch-friendly sizing (min 44px, often 64px)

### Kid-Friendly Design (Ages 8-12)
- Bright gradient colors
- Large text (text-2xl+)
- Encouraging messages
- Fun animations (confetti, star bursts)
- Simple navigation patterns

### Accessibility
- All interactive elements have ARIA labels
- Focus management in modals
- Keyboard navigation support
- Semantic HTML
- Color contrast compliance

## Common Development Tasks

### Adding a New Page
1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx` Routes
3. Add navigation links from appropriate pages
4. Update TypeScript types if needed

### Adding a New Storage Field
1. Update type in `src/types/index.ts`
2. Update type guard in `src/storage/index.ts`
3. Update DEFAULT_SETTINGS if applicable
4. Create migration in `migrations` object if schema changes
5. Increment CURRENT_SCHEMA_VERSION
6. Add tests in `src/storage/storage.test.ts`

### Adding a New Algorithm
1. Create module in `src/algorithms/newAlgorithm.ts`
2. Add comprehensive JSDoc comments
3. Create test file `src/algorithms/newAlgorithm.test.ts`
4. Add demo to `src/algorithms/demo.ts` if helpful
5. Export from `src/algorithms/index.ts` if needed

### Adding a New Component
1. Create in `src/components/NewComponent.tsx`
2. Use TypeScript strict mode
3. Add ARIA attributes for accessibility
4. Make mobile-first (responsive)
5. Export from `src/components/index.ts`
6. Consider adding to ComponentDemo.tsx

### Testing Additions
- Run `pnpm test` to ensure no regressions
- Add unit tests for new logic
- Update `src/__tests__/e2e-manual.md` with manual test scenarios
- Run `pnpm type-check` and `pnpm lint` before committing

## Known Issues

See `ISSUES.md` for detailed list. All issues are minor, no blockers for production.

## Build Configuration

### Vite (vite.config.ts)
- React plugin with fast refresh
- Tailwind CSS v4 plugin
- PWA plugin configured (manifest, service worker)
- Code splitting: react-vendor, chart-vendor, app chunks
- Path alias: `@` → `./src`
- Dev server: localhost:3000
- Preview server: localhost:4173

### TypeScript
- Dual configs: `tsconfig.json` (app), `tsconfig.node.json` (build tools)
- Strict mode with additional safety checks
- Module resolution: bundler mode

### ESLint
- TypeScript ESLint parser
- React hooks plugin
- React refresh plugin
- No unused disable directives

## Mobile-First Considerations

- **Touch targets**: Minimum 44px (iOS), often 64px
- **Viewport**: Uses responsive viewport meta tag
- **Gestures**: No complex gestures, simple taps
- **Orientation**: Portrait-first (can support landscape)
- **Performance**: Code-split chunks, lazy loading
- **Offline**: PWA with service worker (configured)

## Progressive Web App (PWA) Installation

The application is configured as a fully installable Progressive Web App with offline support.

### PWA Features

**Core Capabilities**:
- Installable on iOS, Android, and desktop platforms
- Offline-first architecture with intelligent caching
- App-like experience with standalone display mode
- Background updates with user notification
- Optimized for mobile performance

**Service Worker Configuration**:
- Auto-update strategy with user confirmation
- Multi-layer caching strategy:
  - App shell: NetworkFirst (3s timeout, 7-day cache)
  - Static assets: CacheFirst (1-year cache)
  - Images: CacheFirst (30-day cache)
  - Google Fonts: CacheFirst (1-year cache)
- Offline fallback to cached content
- Automatic cleanup of outdated caches

**Manifest Details**:
- App Name: "Flash Cards - Multiplication Practice"
- Short Name: "Flash Cards"
- Theme Color: #3b82f6 (blue)
- Display Mode: standalone (full-screen app)
- Orientation: portrait (mobile-first)
- Categories: education, kids, games

### Installing the PWA

#### iOS (iPhone/iPad)

1. Open Safari browser (Chrome not supported for iOS PWA)
2. Navigate to the app URL
3. Tap the Share button (square with arrow pointing up)
4. Scroll down and tap "Add to Home Screen"
5. Edit the name if desired (default: "Flash Cards")
6. Tap "Add" in the top-right corner
7. The app icon appears on your home screen

**iOS Notes**:
- Safari is required for installation (iOS limitation)
- App icon will display without browser chrome
- No back button visible in standalone mode
- Uses iOS status bar styling (matches theme color)
- Full offline support once installed

#### Android (Phone/Tablet)

**Chrome Browser**:
1. Open Chrome browser
2. Navigate to the app URL
3. Wait for the "Add to Home screen" banner to appear (automatic)
4. Tap "Install" or "Add"
5. Confirm installation
6. The app icon appears on your home screen

**Alternative Method**:
1. Tap the three-dot menu in Chrome
2. Select "Install app" or "Add to Home screen"
3. Confirm installation

**Android Notes**:
- Works in Chrome, Edge, Samsung Internet, Firefox
- Automatic install prompt after engagement criteria
- Displays in app drawer and home screen
- Full offline support with background sync
- Can be uninstalled like native apps

#### Desktop (Windows/Mac/Linux)

**Chrome/Edge/Brave**:
1. Open the browser
2. Navigate to the app URL
3. Look for install icon in address bar (⊕ or computer icon)
4. Click the install icon
5. Click "Install" in the dialog
6. App opens in standalone window

**Alternative Method**:
1. Click the three-dot menu
2. Select "Install [App Name]..."
3. Confirm installation

**Desktop Notes**:
- App opens in dedicated window (no browser UI)
- Pinnable to taskbar/dock
- Full keyboard navigation support
- Offline support with service worker
- Can be uninstalled from Chrome settings

### Verifying PWA Installation

**Check Service Worker**:
1. Open browser DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Check "Service Workers" section
4. Should show active service worker for the app domain

**Check Manifest**:
1. In DevTools Application tab
2. Click "Manifest" in left sidebar
3. Verify icon display and app metadata
4. Check installability status

**Lighthouse PWA Audit**:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Run audit
5. Should score 90+ for PWA criteria

### Offline Functionality

**What Works Offline**:
- Full app functionality (all routes, features)
- Create and manage users
- Practice sessions
- View historical reports
- All localStorage data persistence

**What Requires Network**:
- Initial app download
- Service worker updates
- Google Fonts (cached after first load)
- External resources (if any added later)

**Cache Management**:
- Service worker caches cleared on version updates
- Browser cache settings apply
- Can clear cache in browser settings
- localStorage persists independently

### Development PWA Testing

**Enable PWA in Development**:
```bash
pnpm dev  # Service worker registers in dev mode
```

**Build and Test**:
```bash
pnpm build
pnpm preview  # Test production build with PWA
```

**Bypass Service Worker** (for debugging):
1. Open DevTools → Application → Service Workers
2. Check "Bypass for network"
3. Reload page

**Update Service Worker**:
1. Make code changes
2. Run `pnpm build`
3. Service worker auto-updates on next visit
4. User sees update prompt

### Icon Assets

**Generated Icons**:
- `icon.svg` - Vector source (scalable)
- `icon-192x192.png` - Android, Chrome
- `icon-512x512.png` - Android, Chrome (maskable)
- `apple-touch-icon.png` - iOS (180x180)
- `favicon-32x32.png` - Browser tab
- `favicon-16x16.png` - Browser tab

**Regenerate Icons**:
```bash
pnpm tsx scripts/generate-icons.ts
```

**Requirements**:
- sharp package (installed as dev dependency)
- Source SVG in `public/icon.svg`
- Outputs to `public/` directory

### Production Deployment Considerations

**HTTPS Required**:
- Service workers require HTTPS (or localhost)
- Most hosting providers auto-provision SSL
- HTTP will not register service worker

**Hosting Recommendations**:
- Vercel, Netlify, GitHub Pages (auto HTTPS)
- Configure proper cache headers
- Set long-lived cache for assets (1 year)
- Set short cache for HTML (revalidate)

**Update Strategy**:
- New deployments auto-update service worker
- Users see update prompt on next visit
- Clicking "Reload" applies update immediately
- No forced updates (user-controlled)

## Performance Benchmarks

From automated tests:
- **1000 user creation**: < 5s (373ms achieved)
- **Session generation**: < 50ms
- **Storage operations**: < 10ms average
- **Bundle sizes**: 177 KB gzipped total

## Before Each Task

Always check available MCPs (Model Context Protocols) for tool integrations.

## Production Checklist

When making changes:
- ✅ Run `pnpm type-check` (must pass with 0 errors)
- ✅ Run `pnpm lint` (must pass with 0 warnings)
- ✅ Run `pnpm test:run` (must pass 241/241 tests)
- ✅ Run `pnpm build` (must succeed)
- ✅ Test in mobile viewport (Chrome DevTools)
- ✅ Test keyboard navigation
- ✅ Verify localStorage operations work

## Support Documentation

- **QA-REPORT.md**: Comprehensive test results
- **PROJECT-SUMMARY.md**: Feature completeness report
- **ISSUES.md**: Known issues with risk assessment
- **src/__tests__/e2e-manual.md**: Manual testing guide
