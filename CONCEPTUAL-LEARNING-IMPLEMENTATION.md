# Conceptual Learning Implementation Plan

## Overview

This document outlines the implementation plan for adding conceptual multiplication understanding to the flash cards application, based on comprehensive UX research of best-in-class educational apps (Brilliant, Khan Academy, Matific, DragonBox).

## Research Summary

**Key Finding**: Visual array models with on-demand access are most effective for ages 8-12, balancing practice speed with conceptual understanding.

**Best Practices from Industry Leaders**:
- **Array models** are universally used (rows × columns visualization)
- **On-demand help** prevents flow interruption
- **Brief animations** (2-3 seconds) engage without boring
- **Multiple representations** reinforce concepts
- **Concrete-Pictorial-Symbolic progression** matches 8-12 cognitive development

---

## P0: On-Demand "Show Me How" Button (PRIORITY IMPLEMENTATION)

### Estimated Effort: 5-6 hours

### Feature Description

Add a "Show Me How" button to the SessionPage that displays an animated array visualization helping children understand what multiplication means conceptually.

### User Experience

**Location**: SessionPage, positioned between the problem display and NumberPad

**Interaction**:
1. Child taps "Show Me How" button
2. Animated array visualization appears showing dots arranged in rows × columns
3. Animation sequence (2-3 seconds):
   - Rows of dots appear sequentially
   - Total count displays
   - Final equation appears
4. Child can tap "Got It!" to dismiss or tap button again to hide

**Self-Directed**: Only shown when child requests it - no impact on practice speed for children who don't need it.

### Component Specifications

#### New Component: `ArrayVisualization.tsx`

**Location**: `/src/components/ArrayVisualization.tsx`

**Props Interface**:
```typescript
export interface ArrayVisualizationProps {
  operand1: number;
  operand2: number;
  correctAnswer: number;
  variant?: 'full' | 'compact'; // full = standalone, compact = in feedback
  onComplete?: () => void;
}
```

**Behavior**:
- **Small problems** (≤20 dots): 10px dots, slower animation
- **Medium problems** (21-100 dots): 8px dots, standard animation
- **Large problems** (>100 dots): Symbolic representation (no full array)
- **Reduced motion**: Show all dots immediately if user prefers reduced motion
- **Accessibility**: Screen reader announces the visualization content

**Visual Design**:
- **Container**: Purple-to-blue gradient background (`from-purple-50 to-blue-50`)
- **Border**: 2px indigo border (`border-indigo-200`)
- **Dots**:
  - Blue circles (`bg-blue-500`)
  - Size varies: 6px-10px based on problem size
  - Gap: 2px-4px between dots
- **Typography**:
  - Title: `text-xl font-bold text-gray-900`
  - Description: `text-lg font-semibold text-gray-700`
  - Total count: `text-2xl font-black text-purple-600`
  - Equation: `text-3xl font-black text-gray-900`

**Animation Timeline** (for 6×7 example):
```
0.0s  - Title "Understanding 6 × 7" appears
0.3s  - "6 groups of 7:" description appears
0.5s  - First row of 7 dots fades in (left to right, 100ms each)
0.9s  - Second row fades in
1.3s  - Third row fades in
1.7s  - Fourth row fades in
2.0s  - Fifth row fades in
2.2s  - Sixth row fades in
2.4s  - "Total: 42 dots" pulses in
2.7s  - "6 × 7 = 42" appears
3.0s  - Animation complete, onComplete callback fires
```

**Large Problem Handling** (>100 dots):
Instead of full array, show symbolic representation:
```
Understanding 11 × 12

11 groups of 12

[Large number display]
132
dots total

11 × 12 = 132
```

#### Component Implementation Details

```typescript
// Core logic structure
const ArrayVisualization: React.FC<ArrayVisualizationProps> = ({
  operand1,
  operand2,
  correctAnswer,
  variant = 'full',
  onComplete,
}) => {
  const [visibleDots, setVisibleDots] = useState(0);
  const [showTotal, setShowTotal] = useState(false);
  const [showEquation, setShowEquation] = useState(false);
  const prefersReducedMotion = useReducedMotion(); // Need to create this hook

  const totalDots = operand1 * operand2;
  const isLargeProblem = totalDots > 100;

  // Calculate dot size
  const getDotSize = () => {
    if (variant === 'compact') return 4;
    if (totalDots <= 20) return 10;
    if (totalDots <= 72) return 8;
    return 6;
  };

  const dotSize = getDotSize();
  const gap = Math.max(2, dotSize / 2);

  // Animation effect
  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleDots(totalDots);
      setShowTotal(true);
      setShowEquation(true);
      return;
    }

    const animationDuration = variant === 'compact' ? 1200 : 2500;
    const dotRevealTime = animationDuration * 0.6;
    const dotsPerFrame = Math.max(1, Math.floor(totalDots / 10));

    const dotInterval = setInterval(() => {
      setVisibleDots(prev => {
        if (prev >= totalDots) {
          clearInterval(dotInterval);
          return totalDots;
        }
        return Math.min(prev + dotsPerFrame, totalDots);
      });
    }, dotRevealTime / 10);

    setTimeout(() => setShowTotal(true), dotRevealTime + 200);
    setTimeout(() => {
      setShowEquation(true);
      onComplete?.();
    }, animationDuration);

    return () => clearInterval(dotInterval);
  }, [totalDots, prefersReducedMotion, variant, onComplete]);

  // Render logic for large vs normal problems
  // Array grid with animated dots
  // Accessibility announcements
};
```

### SessionPage Integration

**File**: `/src/pages/SessionPage.tsx`

**Changes Required**:

1. **Add state** (after existing state declarations around line 50):
```typescript
const [showVisualization, setShowVisualization] = useState(false);
```

2. **Add "Show Me How" button** (between problem display and NumberPad, around line 392):
```tsx
{/* Show Me How Button */}
<button
  onClick={() => {
    setShowVisualization(prev => !prev);
    // Track that visualization was shown
    if (!showVisualization && currentCard) {
      // Will be saved when answer submitted
    }
  }}
  disabled={feedback !== null}
  className="my-4 px-6 py-3 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 mx-auto focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
  aria-label="Show visual explanation of how to solve this problem"
  aria-expanded={showVisualization}
>
  <Eye size={20} />
  {showVisualization ? 'Hide Explanation' : 'Show Me How'}
</button>

{/* Visualization Display */}
{showVisualization && currentCard && (
  <div className="my-4 animate-fadeIn">
    <ArrayVisualization
      operand1={currentCard.operand1}
      operand2={currentCard.operand2}
      correctAnswer={currentCard.correctAnswer}
      variant="full"
    />
  </div>
)}
```

3. **Track visualization usage** (in handleSubmitAnswer, around line 200):
```typescript
const updatedCard: Card = {
  ...currentCard,
  userAnswer,
  isCorrect,
  visualizationShown: showVisualization, // NEW: track if "Show Me How" was used
};
```

4. **Reset visualization state** (when moving to next card):
```typescript
setShowVisualization(false); // Add this when currentCardIndex changes
```

5. **Add keyboard shortcut** (in existing useKeyboard hook or new useEffect):
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'h' || e.key === 'H') {
      if (feedback === null) { // Only when not showing feedback
        setShowVisualization(prev => !prev);
      }
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [feedback]);
```

### Type Updates

**File**: `/src/types/index.ts`

**Add to Card interface** (around line 45):
```typescript
export interface Card {
  problem: string;
  operand1: number;
  operand2: number;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  visualizationShown?: boolean; // NEW: track if child used "Show Me How"
}
```

### New Hook: useReducedMotion

**File**: `/src/hooks/useReducedMotion.ts`

```typescript
import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * @returns boolean indicating if reduced motion is preferred
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};
```

### Animation Utilities

**File**: `tailwind.config.ts`

**Add to theme.extend** (if not already present):
```typescript
keyframes: {
  fadeIn: {
    '0%': { opacity: '0', transform: 'scale(0.95)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
},
animation: {
  fadeIn: 'fadeIn 200ms ease-out',
},
```

### Component Export

**File**: `/src/components/index.ts`

**Add**:
```typescript
export { ArrayVisualization } from './ArrayVisualization';
export type { ArrayVisualizationProps } from './ArrayVisualization';
```

### Import Requirements

**SessionPage.tsx** needs:
```typescript
import { Eye } from 'lucide-react';
import { ArrayVisualization } from '@/components';
```

---

## Testing Requirements for P0

### Unit Tests

**File**: `/src/components/ArrayVisualization.test.tsx`

**Test Cases**:
1. ✅ Renders with correct title "Understanding X × Y"
2. ✅ Shows correct number of dots (operand1 × operand2)
3. ✅ Arranges dots in correct grid (rows = operand1, columns = operand2)
4. ✅ Displays correct total count
5. ✅ Shows correct equation
6. ✅ Handles small problems (larger dots)
7. ✅ Handles large problems (symbolic representation)
8. ✅ Respects reduced motion preference (no animation)
9. ✅ Calls onComplete callback when animation finishes
10. ✅ Supports both 'full' and 'compact' variants
11. ✅ Has proper ARIA labels for accessibility
12. ✅ Announces content to screen readers

### Integration Tests

**File**: `/src/__tests__/integration.test.tsx`

**Test Cases**:
1. ✅ "Show Me How" button appears on SessionPage
2. ✅ Button is disabled when feedback is shown
3. ✅ Clicking button shows visualization
4. ✅ Clicking button again hides visualization
5. ✅ Visualization resets when moving to next card
6. ✅ Keyboard shortcut 'H' toggles visualization
7. ✅ Card tracks visualizationShown = true when used
8. ✅ Card tracks visualizationShown = false when not used
9. ✅ Visualization doesn't impact session flow speed
10. ✅ Button has correct touch target size (56px minimum)

### Manual Testing Checklist

**File**: `/src/__tests__/e2e-manual.md` (add new section)

**Test Scenarios**:
1. [ ] Start session, verify "Show Me How" button appears
2. [ ] Tap button, verify visualization animates smoothly
3. [ ] Verify animation completes in ~2.5 seconds
4. [ ] Tap button again, verify visualization hides
5. [ ] Submit answer, verify visualization resets on next card
6. [ ] Test with small problem (3×4), verify larger dots
7. [ ] Test with medium problem (6×7), verify standard dots
8. [ ] Test with large problem (11×12), verify symbolic representation
9. [ ] Press 'H' key, verify keyboard shortcut works
10. [ ] Test on mobile device (iPhone/Android)
11. [ ] Verify touch target is easy to tap (56px)
12. [ ] Test with reduced motion enabled (macOS System Preferences)
13. [ ] Test with screen reader (VoiceOver/TalkBack)
14. [ ] Verify button is disabled during feedback display
15. [ ] Complete session, verify visualizationShown data in localStorage

### Accessibility Testing

1. [ ] Screen reader announces visualization content
2. [ ] ARIA labels are correct and descriptive
3. [ ] Keyboard navigation works (Tab, H key)
4. [ ] Focus indicators are visible
5. [ ] Color contrast meets WCAG AA (4.5:1)
6. [ ] Touch targets meet minimum size (44px iOS, 48px Android) - using 56px
7. [ ] Reduced motion preference is respected

---

## Success Criteria for P0

### User Experience
- ✅ Children can access visualization in ≤1 tap
- ✅ Animation completes in <3 seconds
- ✅ No impact on practice speed for children who don't use it
- ✅ Works smoothly on iPhone SE (smallest target device)
- ✅ Screen reader announces visualization content

### Technical
- ✅ 0 TypeScript errors
- ✅ 0 ESLint warnings
- ✅ All existing tests passing (241+)
- ✅ New tests passing (12+ new tests)
- ✅ Lighthouse accessibility score 100
- ✅ No performance regressions
- ✅ Bundle size increase < 5KB gzipped

### Code Quality
- ✅ Component is reusable and well-documented
- ✅ Props interface is type-safe
- ✅ Follows existing code patterns
- ✅ JSDoc comments for all public APIs
- ✅ Handles edge cases (large numbers, errors)

---

## P1: Enhanced Incorrect Feedback (NEXT IMPLEMENTATION)

### Estimated Effort: 3-4 hours

### Feature Description

When a child answers incorrectly, automatically show a compact array visualization alongside the "Incorrect! Answer: X" message. This leverages the teachable moment when the child is already paused for feedback.

### Implementation Details

**File**: `/src/pages/SessionPage.tsx`

**Location**: Incorrect feedback section (around line 410-415)

**Current Code**:
```tsx
{feedback === 'incorrect' && (
  <div className="p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-xl text-white text-center animate-shake flex items-center justify-center gap-3">
    <X size={28} />
    <span className="text-2xl font-bold">
      Incorrect! Answer: {currentCard.correctAnswer}
    </span>
  </div>
)}
```

**Enhanced Code**:
```tsx
{feedback === 'incorrect' && (
  <div className="space-y-4">
    {/* Existing incorrect message */}
    <div className="p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-xl text-white text-center animate-shake flex items-center justify-center gap-3">
      <X size={28} />
      <span className="text-2xl font-bold">
        Incorrect! Answer: {currentCard.correctAnswer}
      </span>
    </div>

    {/* NEW: Compact visualization */}
    <div className="animate-fadeIn">
      <p className="text-lg font-semibold text-gray-700 mb-2 text-center">
        Let's see why:
      </p>
      <ArrayVisualization
        operand1={currentCard.operand1}
        operand2={currentCard.operand2}
        correctAnswer={currentCard.correctAnswer}
        variant="compact"
      />
    </div>
  </div>
)}
```

**Key Points**:
- Uses `variant="compact"` for smaller, faster visualization
- Appears within existing 2.5s feedback delay - no additional time cost
- Auto-shows without user interaction
- Helps reinforce correct answer visually

### First-Time Onboarding

**File**: `/src/pages/SessionPage.tsx`

**Implementation**:

1. **Add state** (check if user has seen tutorial):
```typescript
const [showOnboarding, setShowOnboarding] = useState(false);

useEffect(() => {
  // Check if this is user's first session
  const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${userId}`);
  if (!hasSeenTutorial && currentCardIndex === 0) {
    setShowOnboarding(true);
  }
}, [userId, currentCardIndex]);
```

2. **Create onboarding modal** (show before first problem):
```tsx
{showOnboarding && (
  <Modal
    isOpen={showOnboarding}
    onClose={() => {
      localStorage.setItem(`tutorial_seen_${userId}`, 'true');
      setShowOnboarding(false);
    }}
    title="💡 Helpful Tip!"
  >
    <div className="space-y-4">
      <p className="text-lg text-gray-700">
        If you're stuck on a problem, tap <strong className="text-purple-600">"Show Me How"</strong> to see a visual explanation!
      </p>

      <div className="bg-gray-50 p-4 rounded-xl">
        <p className="text-sm text-gray-600 mb-3">Here's an example for 3 × 4:</p>
        <ArrayVisualization
          operand1={3}
          operand2={4}
          correctAnswer={12}
          variant="compact"
        />
      </div>

      <Button onClick={() => {
        localStorage.setItem(`tutorial_seen_${userId}`, 'true');
        setShowOnboarding(false);
      }}>
        Got It! Let's Start
      </Button>
    </div>
  </Modal>
)}
```

3. **Add settings toggle** (optional - allow re-showing tutorial):

**File**: `/src/pages/SettingsPage.tsx`

```tsx
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
  <div>
    <label className="text-lg font-semibold text-gray-900">
      Show Tutorial
    </label>
    <p className="text-sm text-gray-600">
      Replay the "Show Me How" feature introduction
    </p>
  </div>
  <Button
    variant="secondary"
    onClick={() => {
      localStorage.removeItem(`tutorial_seen_${currentUser?.id}`);
      // Show success toast
    }}
  >
    Reset Tutorial
  </Button>
</div>
```

### Testing Requirements for P1

**Unit Tests**:
1. ✅ Compact visualization renders correctly
2. ✅ Compact variant has smaller dots (4px)
3. ✅ Animation is faster (1.2s vs 2.5s)
4. ✅ Onboarding modal shows on first session
5. ✅ Onboarding doesn't show on subsequent sessions
6. ✅ Tutorial seen flag saved to localStorage

**Integration Tests**:
1. ✅ Incorrect feedback shows visualization automatically
2. ✅ Visualization appears within feedback delay (no extra wait)
3. ✅ Onboarding shows before first problem
4. ✅ Onboarding can be dismissed
5. ✅ Tutorial reset button works in settings

**Manual Tests**:
1. [ ] Answer incorrectly, verify compact visualization shows
2. [ ] Verify visualization fits within red feedback box
3. [ ] Create new user, verify onboarding shows
4. [ ] Dismiss onboarding, verify it doesn't show again
5. [ ] Complete session, create another session, verify no onboarding
6. [ ] Reset tutorial in settings, verify onboarding shows again

---

## Success Criteria for P1

### User Experience
- ✅ Visual feedback appears automatically when incorrect
- ✅ No additional wait time (uses existing 2.5s delay)
- ✅ Onboarding is helpful but skippable
- ✅ Tutorial doesn't annoy repeat users

### Technical
- ✅ 0 TypeScript errors
- ✅ 0 ESLint warnings
- ✅ All tests passing (241+ existing + P0 + P1)
- ✅ localStorage usage minimal (1 flag per user)

---

## Performance Considerations

### Bundle Size
- ArrayVisualization component: ~2-3KB gzipped
- useReducedMotion hook: ~0.5KB gzipped
- Total P0 impact: ~3-4KB (acceptable)

### Runtime Performance
- Animation uses CSS transforms (GPU-accelerated)
- No layout thrashing
- Dots rendered with CSS, not images
- Works smoothly on iPhone SE / older Android devices

### Memory
- Component unmounts when hidden (no memory leak)
- Animation intervals cleaned up properly
- No persistent timers

---

## Accessibility Compliance

### WCAG 2.1 AA Standards
- ✅ Color contrast 4.5:1 minimum
- ✅ Touch targets 44px minimum (using 56px)
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Reduced motion support
- ✅ Focus indicators visible
- ✅ ARIA labels descriptive

### Screen Reader Testing
Test with:
- VoiceOver (iOS/macOS)
- TalkBack (Android)
- NVDA (Windows)

Expected announcements:
- "Show visual explanation of how to solve this problem, button"
- "Showing 6 rows of 7 dots. Total: 42 dots. 6 times 7 equals 42"

---

## Documentation Updates

### Files to Update
1. **CLAUDE.md** - Add ArrayVisualization to component list
2. **PROJECT-SUMMARY.md** - Note conceptual learning feature
3. **src/__tests__/e2e-manual.md** - Add visualization test scenarios
4. **README.md** (if exists) - Document new feature

### Component Documentation
ArrayVisualization.tsx needs JSDoc:
```typescript
/**
 * Visual array representation of a multiplication problem.
 *
 * Displays an animated grid of dots arranged in rows × columns to help
 * children understand what multiplication means conceptually. Supports
 * both full-size standalone visualizations and compact versions for
 * inline feedback.
 *
 * @example
 * ```tsx
 * <ArrayVisualization
 *   operand1={6}
 *   operand2={7}
 *   correctAnswer={42}
 *   variant="full"
 *   onComplete={() => console.log('Animation finished')}
 * />
 * ```
 *
 * Features:
 * - Adaptive sizing based on problem size
 * - Smooth animations with reduced motion support
 * - Accessibility: screen reader announcements, ARIA labels
 * - Mobile-optimized with touch-friendly sizing
 * - Symbolic representation for large problems (>100 dots)
 *
 * @param operand1 - First operand (number of rows)
 * @param operand2 - Second operand (number of columns)
 * @param correctAnswer - The product (operand1 × operand2)
 * @param variant - Display mode: 'full' for standalone, 'compact' for feedback
 * @param onComplete - Optional callback fired when animation completes
 */
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All P0 tests passing
- [ ] Type check passes (`pnpm type-check`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Manual testing on mobile devices complete
- [ ] Accessibility audit complete
- [ ] Performance check (no regressions)

### Post-Deployment (P0)
- [ ] Monitor usage analytics (% using "Show Me How")
- [ ] Collect user feedback (parents/teachers)
- [ ] Measure impact on session completion rates
- [ ] Track correlation with score improvement
- [ ] Wait 1-2 weeks for data before P1

### Pre-Deployment (P1)
- [ ] All P1 tests passing
- [ ] Verify incorrect feedback enhancement works
- [ ] Test onboarding flow end-to-end
- [ ] Verify tutorial reset works
- [ ] Check localStorage usage

### Post-Deployment (P1)
- [ ] Monitor A/B test results (if applicable)
- [ ] Measure repeat error rate changes
- [ ] Track onboarding completion rate
- [ ] Gather feedback on automatic visualizations
- [ ] Decide on P2 features based on data

---

## Analytics to Track

### P0 Metrics
1. **Usage Rate**: % of children who use "Show Me How" at least once per session
2. **Usage Frequency**: Average number of times per session
3. **Temporal Pattern**: Does usage decrease over time (indicates learning)?
4. **Correlation**: Relationship between visualization usage and score improvement
5. **Session Impact**: Does it increase session abandonment? (should not)
6. **Performance**: Any frame drops or animation issues?

### P1 Metrics
1. **Repeat Error Rate**: Do children make same mistake twice after seeing visualization?
2. **Onboarding Completion**: % who complete tutorial vs skip
3. **Tutorial Reset**: How many users replay tutorial?
4. **Feedback Effectiveness**: Score improvement on problems with incorrect feedback viz

### Data Structure (for analytics)
```typescript
interface SessionAnalytics {
  sessionId: string;
  userId: string;
  visualizationUsageCount: number; // how many times "Show Me How" tapped
  cardsWithVisualization: number; // how many cards had viz shown
  totalCards: number;
  score: number;
  timestamp: number;
}
```

---

## Implementation Timeline

### P0 Timeline (5-6 hours)
- **Hour 1-2**: Create ArrayVisualization component
- **Hour 2-3**: Integrate into SessionPage
- **Hour 3-4**: Add useReducedMotion hook, type updates
- **Hour 4-5**: Write tests (unit + integration)
- **Hour 5-6**: Manual testing, accessibility audit, fixes

### P1 Timeline (3-4 hours)
- **Hour 1**: Add compact visualization to incorrect feedback
- **Hour 1-2**: Create onboarding modal
- **Hour 2-3**: Add settings toggle for tutorial reset
- **Hour 3-4**: Write tests, manual testing

### Total Time: 8-10 hours

---

## Future Enhancements (P2 - Not in Current Scope)

These are deferred until P0/P1 are measured:

1. **Learning Mode Toggle** (Settings)
   - Auto-show visualizations for ALL problems
   - Slower, more educational mode

2. **Multiple Visualization Types**
   - Grouping model (circles with groups)
   - Number line
   - Area model (grid shading)

3. **Progress Tracking**
   - "You've mastered 7×8!" badges
   - Visual progress indicators

4. **Interactive Manipulatives**
   - Draggable dots to form groups
   - Touch-based counting

5. **Commutative Property**
   - Show 6×7 and 7×6 side-by-side
   - "Same answer!" message

---

## Questions for Product Owner

Before starting implementation:

1. **Analytics**: Do we have analytics tracking in place? Where should we send events?
2. **A/B Testing**: Should we A/B test P1 (auto-show on incorrect)?
3. **Settings**: Should "Show Me How" feature be toggleable in Settings?
4. **Localization**: Are there plans for i18n? (affects text in visualizations)
5. **Data Privacy**: Any concerns about tracking visualizationShown in localStorage?

---

## References

### Research Sources
- Brilliant.org methodology
- Khan Academy Kids approach
- Matific (34% improvement study)
- DragonBox Numbers pedagogy
- Concrete-Pictorial-Symbolic progression research
- WCAG 2.1 accessibility guidelines
- iOS Human Interface Guidelines (touch targets)
- Material Design (Android) touch target specifications

### Related Files
- `/home/rodzilla/projects/flash-cards/UX-DESIGN-REVIEW.md` - Full 70-page UX analysis
- `/home/rodzilla/projects/flash-cards/CLAUDE.md` - Project overview
- `/home/rodzilla/projects/flash-cards/src/pages/SessionPage.tsx` - Main integration point
- `/home/rodzilla/projects/flash-cards/src/types/index.ts` - Type definitions

---

## Contact & Support

For questions about this implementation plan, refer to:
- UX rationale: UX-DESIGN-REVIEW.md
- Technical specs: This document
- Testing guide: src/__tests__/e2e-manual.md (once updated)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-07
**Author**: UX Design Director Agent + Expert Web Developer Agent
**Status**: Ready for Implementation
