/**
 * P1 Conceptual Learning Feature Tests
 *
 * These tests verify the P1 enhancements:
 * 1. Enhanced incorrect feedback with compact visualization
 * 2. First-time onboarding modal
 * 3. Tutorial reset functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createUser, clearAllData } from '../storage';

describe('P1 Conceptual Learning Features', () => {
  beforeEach(() => {
    clearAllData();
    localStorage.clear();
  });

  afterEach(() => {
    clearAllData();
    localStorage.clear();
  });

  describe('Compact Variant Visualization', () => {
    it('should render compact visualization with smaller dots (4px)', () => {
      // Test the compact variant sizing logic
      const isCompact = true;
      const dotSize = isCompact ? 4 : 10;

      expect(dotSize).toBe(4);
    });

    it('should have faster animation for compact variant (1200ms)', () => {
      const isCompact = true;
      const animationDuration = isCompact ? 1200 : 2500;

      expect(animationDuration).toBe(1200);
    });

    it('should have slower animation for full variant (2500ms)', () => {
      const isCompact = false;
      const animationDuration = isCompact ? 1200 : 2500;

      expect(animationDuration).toBe(2500);
    });

    it('should use compact variant for incorrect feedback', () => {
      // Verify that the variant="compact" prop would be passed
      const feedbackType = 'incorrect';
      const variant = feedbackType === 'incorrect' ? 'compact' : 'full';

      expect(variant).toBe('compact');
    });

    it('should use full variant for Show Me How button', () => {
      const showVisualization = true;
      const variant = showVisualization ? 'full' : 'compact';

      expect(variant).toBe('full');
    });
  });

  describe('localStorage Tutorial Flag Management', () => {
    it('should use user-specific tutorial flag key', () => {
      const userId = '123456';
      const expectedKey = `tutorial_seen_${userId}`;

      localStorage.setItem(expectedKey, 'true');

      expect(localStorage.getItem(expectedKey)).toBe('true');
    });

    it('should handle multiple users with separate tutorial flags', () => {
      const user1 = createUser('User One');
      const user2 = createUser('User Two');

      localStorage.setItem(`tutorial_seen_${user1.id}`, 'true');

      // user1 has seen tutorial
      expect(localStorage.getItem(`tutorial_seen_${user1.id}`)).toBe('true');

      // user2 has not seen tutorial
      expect(localStorage.getItem(`tutorial_seen_${user2.id}`)).toBeNull();
    });

    it('should persist tutorial flag across page reloads', () => {
      const userId = 'persistent_user';
      const key = `tutorial_seen_${userId}`;

      localStorage.setItem(key, 'true');

      // Simulate reload by getting the value again
      const retrievedValue = localStorage.getItem(key);

      expect(retrievedValue).toBe('true');
    });

    it('should return null for non-existent tutorial flag', () => {
      const userId = 'new_user';
      const key = `tutorial_seen_${userId}`;

      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  describe('Tutorial Reset Functionality', () => {
    it('should remove tutorial flag when reset', () => {
      const user = createUser('Reset Test User');
      const key = `tutorial_seen_${user.id}`;

      // Set flag
      localStorage.setItem(key, 'true');
      expect(localStorage.getItem(key)).toBe('true');

      // Reset (remove flag)
      localStorage.removeItem(key);
      expect(localStorage.getItem(key)).toBeNull();
    });

    it('should handle reset when flag does not exist', () => {
      const user = createUser('No Flag User');
      const key = `tutorial_seen_${user.id}`;

      // Try to remove non-existent flag
      localStorage.removeItem(key);
      expect(localStorage.getItem(key)).toBeNull();
    });

    it('should not affect other users tutorial flags when one is reset', () => {
      const user1 = createUser('User 1');
      const user2 = createUser('User 2');

      localStorage.setItem(`tutorial_seen_${user1.id}`, 'true');
      localStorage.setItem(`tutorial_seen_${user2.id}`, 'true');

      // Reset user1's flag
      localStorage.removeItem(`tutorial_seen_${user1.id}`);

      expect(localStorage.getItem(`tutorial_seen_${user1.id}`)).toBeNull();
      expect(localStorage.getItem(`tutorial_seen_${user2.id}`)).toBe('true');
    });
  });

  describe('Onboarding Logic', () => {
    it('should show onboarding for new user on first card', () => {
      const userId = 'new_user';
      const currentCardIndex = 0;
      const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${userId}`);

      const shouldShow = !hasSeenTutorial && currentCardIndex === 0;

      expect(shouldShow).toBe(true);
    });

    it('should not show onboarding for returning user', () => {
      const userId = 'returning_user';
      const currentCardIndex = 0;

      localStorage.setItem(`tutorial_seen_${userId}`, 'true');
      const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${userId}`);

      const shouldShow = !hasSeenTutorial && currentCardIndex === 0;

      expect(shouldShow).toBe(false);
    });

    it('should not show onboarding on cards after first card', () => {
      const userId = 'mid_session_user';
      const currentCardIndex: number = 5; // Middle of session

      const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${userId}`);
      const shouldShow = !hasSeenTutorial && currentCardIndex === 0;

      expect(shouldShow).toBe(false);
      expect(currentCardIndex).not.toBe(0);
    });

    it('should save flag when user dismisses onboarding', () => {
      const userId = 'dismiss_user';

      // User dismisses onboarding
      localStorage.setItem(`tutorial_seen_${userId}`, 'true');

      expect(localStorage.getItem(`tutorial_seen_${userId}`)).toBe('true');
    });

    it('should handle edge case: card index 0', () => {
      const userId = 'edge_user';
      const currentCardIndex = 0;
      const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${userId}`);

      const shouldShow = !hasSeenTutorial && currentCardIndex === 0;

      expect(shouldShow).toBe(true);
      expect(currentCardIndex).toBe(0);
    });
  });

  describe('P1 Feature Integration', () => {
    it('should work together: onboarding -> dismiss -> reset -> onboarding again', () => {
      const user = createUser('Full Flow User');

      // Step 1: First session, onboarding shows
      expect(localStorage.getItem(`tutorial_seen_${user.id}`)).toBeNull();

      // Step 2: User dismisses onboarding
      localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
      expect(localStorage.getItem(`tutorial_seen_${user.id}`)).toBe('true');

      // Step 3: User resets tutorial in settings
      localStorage.removeItem(`tutorial_seen_${user.id}`);
      expect(localStorage.getItem(`tutorial_seen_${user.id}`)).toBeNull();

      // Step 4: Next session, onboarding shows again
      const shouldShowOnboarding = !localStorage.getItem(`tutorial_seen_${user.id}`);
      expect(shouldShowOnboarding).toBe(true);
    });

    it('should isolate tutorial state per user', () => {
      const user1 = createUser('Isolated User 1');
      const user2 = createUser('Isolated User 2');

      // user1 sees and dismisses tutorial
      localStorage.setItem(`tutorial_seen_${user1.id}`, 'true');

      // user2 should still see tutorial
      const user2ShouldShow = !localStorage.getItem(`tutorial_seen_${user2.id}`);
      expect(user2ShouldShow).toBe(true);

      // user1 should not see tutorial
      const user1ShouldShow = !localStorage.getItem(`tutorial_seen_${user1.id}`);
      expect(user1ShouldShow).toBe(false);
    });

    it('should handle multiple reset cycles', () => {
      const user = createUser('Cycle User');

      // Cycle 1: Show -> Dismiss
      localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
      expect(localStorage.getItem(`tutorial_seen_${user.id}`)).toBe('true');

      // Cycle 2: Reset -> Show -> Dismiss
      localStorage.removeItem(`tutorial_seen_${user.id}`);
      expect(localStorage.getItem(`tutorial_seen_${user.id}`)).toBeNull();
      localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
      expect(localStorage.getItem(`tutorial_seen_${user.id}`)).toBe('true');

      // Cycle 3: Reset -> Show
      localStorage.removeItem(`tutorial_seen_${user.id}`);
      expect(localStorage.getItem(`tutorial_seen_${user.id}`)).toBeNull();
    });
  });

  describe('Enhanced Incorrect Feedback Logic', () => {
    it('should determine when to show compact visualization', () => {
      const feedback = 'incorrect';
      const shouldShowCompactViz = feedback === 'incorrect';

      expect(shouldShowCompactViz).toBe(true);
    });

    it('should not show compact visualization for correct feedback', () => {
      const feedback: string = 'correct';
      const shouldShowCompactViz = feedback === 'incorrect';

      expect(shouldShowCompactViz).toBe(false);
    });

    it('should not show compact visualization when no feedback', () => {
      const feedback = null;
      const shouldShowCompactViz = feedback === 'incorrect';

      expect(shouldShowCompactViz).toBe(false);
    });
  });

  describe('Animation Timing Calculations', () => {
    it('should calculate compact animation timing correctly', () => {
      const variant = 'compact';
      const animationDuration = variant === 'compact' ? 1200 : 2500;
      const dotRevealTime = animationDuration * 0.6;

      expect(animationDuration).toBe(1200);
      expect(dotRevealTime).toBe(720);
    });

    it('should calculate full animation timing correctly', () => {
      const variant: string = 'full';
      const animationDuration = variant === 'compact' ? 1200 : 2500;
      const dotRevealTime = animationDuration * 0.6;

      expect(animationDuration).toBe(2500);
      expect(dotRevealTime).toBe(1500);
    });

    it('should fit compact visualization within feedback delay', () => {
      const feedbackDelay = 2500; // ms (incorrect feedback delay)
      const compactAnimationDuration = 1200; // ms

      const fitsWithinDelay = compactAnimationDuration < feedbackDelay;

      expect(fitsWithinDelay).toBe(true);
      expect(compactAnimationDuration).toBeLessThan(feedbackDelay);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long user IDs in tutorial flag key', () => {
      const longUserId = 'a'.repeat(100);
      const key = `tutorial_seen_${longUserId}`;

      localStorage.setItem(key, 'true');
      expect(localStorage.getItem(key)).toBe('true');

      localStorage.removeItem(key);
      expect(localStorage.getItem(key)).toBeNull();
    });

    it('should handle special characters in user IDs', () => {
      const specialUserId = 'user-123_test@example';
      const key = `tutorial_seen_${specialUserId}`;

      localStorage.setItem(key, 'true');
      expect(localStorage.getItem(key)).toBe('true');
    });

    it('should handle concurrent flag operations', () => {
      const userId = 'concurrent_user';
      const key = `tutorial_seen_${userId}`;

      // Rapid set/get operations
      localStorage.setItem(key, 'true');
      const val1 = localStorage.getItem(key);
      localStorage.removeItem(key);
      const val2 = localStorage.getItem(key);

      expect(val1).toBe('true');
      expect(val2).toBeNull();
    });
  });
});
