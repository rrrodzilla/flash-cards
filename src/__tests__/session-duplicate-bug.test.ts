/**
 * Test to reproduce and verify fix for duplicate session bug
 *
 * Bug: When a new user completes their first session, the Reports page
 * shows TWO sessions instead of one - one with correct data and one with 0 score.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearAllData,
  createUser,
  createSession,
  updateSession,
  getSessions,
  getSettings,
} from '../storage';
import type { Card } from '../types';

describe('Session Duplicate Bug', () => {
  beforeEach(() => {
    clearAllData();
  });

  it('should create only ONE session when a new user completes their first session', () => {
    // 1. Create a new user (no prior data)
    const user = createUser('Test User');

    // 2. Get settings
    const settings = getSettings();

    // 3. Create a session (simulating SessionPage.tsx line 91)
    const session = createSession(user.id, settings);

    // Verify only one session exists
    const sessionsAfterCreate = getSessions(user.id);
    expect(sessionsAfterCreate).toHaveLength(1);
    expect(sessionsAfterCreate[0]?.sessionId).toBe(session.sessionId);
    expect(sessionsAfterCreate[0]?.score).toBe(0);
    expect(sessionsAfterCreate[0]?.cards).toHaveLength(0);

    // 4. Simulate completing the session with some cards
    const completedCards: Card[] = [
      {
        problem: '2×3',
        operand1: 2,
        operand2: 3,
        userAnswer: 6,
        correctAnswer: 6,
        isCorrect: true,
      },
      {
        problem: '5×4',
        operand1: 5,
        operand2: 4,
        userAnswer: 20,
        correctAnswer: 20,
        isCorrect: true,
      },
      {
        problem: '7×8',
        operand1: 7,
        operand2: 8,
        userAnswer: 54,
        correctAnswer: 56,
        isCorrect: false,
      },
    ];

    // 5. Update session (simulating SessionPage.tsx handleSessionComplete)
    updateSession(session.sessionId, {
      cards: completedCards,
      score: 2,
      totalCards: 3,
      finishTime: 45,
      timedOut: false,
    });

    // 6. Verify STILL only one session exists (not two!)
    const sessionsAfterComplete = getSessions(user.id);
    expect(sessionsAfterComplete).toHaveLength(1);
    expect(sessionsAfterComplete[0]?.sessionId).toBe(session.sessionId);
    expect(sessionsAfterComplete[0]?.score).toBe(2);
    expect(sessionsAfterComplete[0]?.totalCards).toBe(3);
    expect(sessionsAfterComplete[0]?.cards).toHaveLength(3);
    expect(sessionsAfterComplete[0]?.finishTime).toBe(45);
    expect(sessionsAfterComplete[0]?.timedOut).toBe(false);
  });

  it('should not show duplicate sessions in Reports page', () => {
    // This test simulates the exact user flow:
    // 1. Create user
    // 2. Complete one session
    // 3. Navigate to Reports page
    // 4. Reports page should show exactly ONE session

    const user = createUser('New User');
    const settings = getSettings();

    // Complete one session
    const session = createSession(user.id, settings);
    const cards: Card[] = Array.from({ length: 10 }, (_, i) => ({
      problem: `${i + 1}×2`,
      operand1: i + 1,
      operand2: 2,
      userAnswer: (i + 1) * 2,
      correctAnswer: (i + 1) * 2,
      isCorrect: true,
    }));

    updateSession(session.sessionId, {
      cards,
      score: 10,
      totalCards: 10,
      finishTime: 36,
      timedOut: false,
    });

    // Fetch sessions (as Reports page does)
    const allSessions = getSessions(user.id);

    // Should be exactly ONE session
    expect(allSessions).toHaveLength(1);
    expect(allSessions[0]?.score).toBe(10);
    expect(allSessions[0]?.totalCards).toBe(10);

    // Verify no session with 0 score exists
    const zeroScoreSessions = allSessions.filter(s => s.score === 0);
    expect(zeroScoreSessions).toHaveLength(0);
  });

  it('should correctly track multiple sessions for a user', () => {
    const user = createUser('Multi Session User');
    const settings = getSettings();

    // Complete 3 sessions
    for (let i = 0; i < 3; i++) {
      const session = createSession(user.id, settings);
      const cards: Card[] = Array.from({ length: 5 }, (_, j) => ({
        problem: `${j + 1}×${i + 1}`,
        operand1: j + 1,
        operand2: i + 1,
        userAnswer: (j + 1) * (i + 1),
        correctAnswer: (j + 1) * (i + 1),
        isCorrect: true,
      }));

      updateSession(session.sessionId, {
        cards,
        score: 5,
        totalCards: 5,
        finishTime: 30 + i * 10,
        timedOut: false,
      });
    }

    // Verify exactly 3 sessions
    const allSessions = getSessions(user.id);
    expect(allSessions).toHaveLength(3);

    // All sessions should have correct data
    allSessions.forEach(session => {
      expect(session.score).toBe(5);
      expect(session.totalCards).toBe(5);
      expect(session.cards).toHaveLength(5);
      expect(session.finishTime).toBeGreaterThan(0);
    });
  });
});
