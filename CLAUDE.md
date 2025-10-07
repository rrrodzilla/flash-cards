# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A mobile web application for multiplication flash cards (1-12 tables) built with **pnpm**, **Tailwind CSS v4**, and **TypeScript**. Uses local storage for all data persistence.

## Technology Stack

- **Package Manager**: pnpm
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Storage**: Browser Local Storage (no backend)
- **Target**: Mobile web application

## Application Architecture

### User Flow

1. **Splash Screen** → Buttons for "Settings" and "Users"
2. **User Selection** → Add new user or select existing user
3. **Flash Card Session** → Timed session with randomized problems
4. **Session End** → Score recording + either timeout prompt or celebration screen

### Core Features

#### Settings/Configuration
Settings must include:
- **Number Selection**: Which numbers (1-12) to include in flash cards
- **Session Length**: Number of flash cards per session
- **Time Limit**: Time allowed for the session (in seconds/minutes)
- **Data Management**: Button to wipe local storage

#### Session Logic
- **Random Generation**: Create multiplication problems using selected numbers
- **Weighted Randomization**: Problems are weighted based on past errors
  - Uses max binary heap for weighting wrong answer frequencies
  - Analyzes up to the **past 3 sessions** for each user
  - If user has gotten none wrong over past 3 sessions → pure random
  - Numbers appearing in wrong answers appear more frequently
  - Example: If user often gets 2×8, 8×3, 2×2 wrong → problems with 2, 8, and 3 appear more frequently, with 2 weighted highest, then 8, then 3

#### Session Tracking
For each session, track:
- Cards displayed
- Answers given
- Correctness of each answer
- Time elapsed
- Finish time (if completed before timeout)

#### Session End Conditions
1. **Timeout**: Session ends, overall score recorded, user prompted to restart
2. **Completion**: Score recorded, celebratory screen shown with score and finish time

#### Reports
Each user has a report page showing:
- Statistics over time
- Data displayed as **both table and graph**

### Data Model (Local Storage)

#### Users
```typescript
{
  id: string;
  name: string;
  createdAt: timestamp;
}
```

#### Settings
```typescript
{
  includedNumbers: number[]; // Array of numbers 1-12
  cardsPerSession: number;
  timeLimit: number; // in seconds
}
```

#### Session History
```typescript
{
  userId: string;
  sessionId: string;
  timestamp: timestamp;
  cards: Array<{
    problem: string; // e.g., "2×8"
    operand1: number;
    operand2: number;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
  }>;
  score: number;
  totalCards: number;
  finishTime?: number; // time in seconds if completed
  timedOut: boolean;
}
```

### Weighted Randomization Algorithm

1. Collect wrong answers from past 3 sessions for current user
2. Count frequency of each number (1-12) in wrong answers
3. Build max binary heap based on frequency counts
4. When generating problems:
   - If no wrong answers in past 3 sessions → pure random
   - Otherwise, higher-frequency numbers appear more often in new problems
5. Numbers must still respect the "includedNumbers" setting

### Key Technical Considerations

- **Mobile-First Design**: Optimize for mobile web browsers
- **Local Storage Only**: All persistence via `localStorage` API
- **TypeScript Strict Mode**: Use proper typing throughout
- **Tailwind CSS v4**: Follow v4 conventions and new features
- **Binary Heap Implementation**: Needed for weighted randomization
- **Session State Management**: Handle in-progress sessions, timeouts, and completions

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Before Each Task

**IMPORTANT**: Always consult available MCPs (Model Context Protocols) before starting any task to ensure proper integration with external tools and services.

## Project Structure Guidelines

### Recommended Organization
```
src/
├── components/     # React/UI components
├── lib/           # Utility functions, helpers
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
├── storage/       # Local storage abstraction layer
├── algorithms/    # Binary heap, weighted random, etc.
└── pages/         # Page components (splash, session, reports, settings)
```

### Storage Layer
Create abstraction for localStorage operations:
- User CRUD
- Settings CRUD
- Session history CRUD
- Clear all data function

### Algorithm Layer
Implement:
- Max binary heap for frequency counting
- Weighted random number generator
- Session score calculator
- Past sessions analyzer (last 3 sessions)

## Important Implementation Notes

1. **Timer Management**: Use `setInterval` or `requestAnimationFrame` for session timer
2. **Persistence**: Save session progress periodically to prevent data loss
3. **Validation**: Validate user inputs for settings (numbers 1-12, positive integers)
4. **Accessibility**: Ensure mobile touch targets are appropriately sized
5. **Graph/Chart Library**: Will need to select and integrate a charting library for reports (e.g., Chart.js, Recharts)
6. **State Management**: Consider React Context or similar for global state (current user, settings)

## Data Integrity

- Always validate data from localStorage (may be corrupted)
- Provide fallback defaults for missing settings
- Handle edge cases: no users, no sessions, corrupted data

## Testing Strategy

- Test weighted randomization with various wrong answer scenarios
- Test session timeout behavior
- Test localStorage limits and quota exceeded scenarios
- Test with different mobile viewports
