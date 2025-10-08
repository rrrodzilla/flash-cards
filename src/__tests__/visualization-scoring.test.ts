/**
 * Tests for visualization scoring behavior
 *
 * Ensures that cards where the user viewed the "Show Me How" visualization
 * before answering do not count toward their score or analytics.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeWrongAnswers } from '../algorithms/weightedRandom';
import {
  findWeakNumbers,
  findStrongNumbers,
  findMostMissedProblem,
  calculateNumberAccuracy,
} from '../lib/calculations';
import type { Session, Card } from '../types';

describe('Visualization Scoring', () => {
  beforeEach(() => {
    // No setup needed - tests are isolated
  });

  describe('Score Calculation', () => {
    it('should not count correct answers when visualization was shown', () => {
      const cards: Card[] = [
        {
          problem: '5×6',
          operand1: 5,
          operand2: 6,
          correctAnswer: 30,
          userAnswer: 30,
          isCorrect: true,
          visualizationShown: true,
          countsTowardScore: false,
        },
        {
          problem: '3×4',
          operand1: 3,
          operand2: 4,
          correctAnswer: 12,
          userAnswer: 12,
          isCorrect: true,
          visualizationShown: false,
          countsTowardScore: true,
        },
      ];

      const score = cards.filter((c) => c.isCorrect && c.countsTowardScore !== false).length;
      expect(score).toBe(1);
    });

    it('should not count incorrect answers when visualization was shown', () => {
      const cards: Card[] = [
        {
          problem: '7×8',
          operand1: 7,
          operand2: 8,
          correctAnswer: 56,
          userAnswer: 54,
          isCorrect: false,
          visualizationShown: true,
          countsTowardScore: false,
        },
        {
          problem: '6×9',
          operand1: 6,
          operand2: 9,
          correctAnswer: 54,
          userAnswer: 52,
          isCorrect: false,
          visualizationShown: false,
          countsTowardScore: true,
        },
      ];

      const incorrectCount = cards.filter((c) => !c.isCorrect && c.countsTowardScore !== false)
        .length;
      expect(incorrectCount).toBe(1);
    });

    it('should handle mixed scenarios correctly', () => {
      const cards: Card[] = [
        // Correct with visualization - don't count
        {
          problem: '2×3',
          operand1: 2,
          operand2: 3,
          correctAnswer: 6,
          userAnswer: 6,
          isCorrect: true,
          visualizationShown: true,
          countsTowardScore: false,
        },
        // Correct without visualization - count
        {
          problem: '4×5',
          operand1: 4,
          operand2: 5,
          correctAnswer: 20,
          userAnswer: 20,
          isCorrect: true,
          visualizationShown: false,
          countsTowardScore: true,
        },
        // Incorrect with visualization - don't count
        {
          problem: '7×8',
          operand1: 7,
          operand2: 8,
          correctAnswer: 56,
          userAnswer: 54,
          isCorrect: false,
          visualizationShown: true,
          countsTowardScore: false,
        },
        // Incorrect without visualization - count
        {
          problem: '9×6',
          operand1: 9,
          operand2: 6,
          correctAnswer: 54,
          userAnswer: 48,
          isCorrect: false,
          visualizationShown: false,
          countsTowardScore: true,
        },
      ];

      const score = cards.filter((c) => c.isCorrect && c.countsTowardScore !== false).length;
      expect(score).toBe(1);

      const incorrectCount = cards.filter((c) => !c.isCorrect && c.countsTowardScore !== false)
        .length;
      expect(incorrectCount).toBe(1);
    });
  });

  describe('Weighted Randomization', () => {
    it('should not use cards with visualizations in wrong answer analysis', () => {
      const sessions: Session[] = [
        {
          userId: 'user1',
          sessionId: 'session1',
          timestamp: Date.now(),
          score: 0,
          totalCards: 2,
          timedOut: false,
          cards: [
            {
              problem: '7×8',
              operand1: 7,
              operand2: 8,
              correctAnswer: 56,
              userAnswer: 54,
              isCorrect: false,
              visualizationShown: true,
              countsTowardScore: false,
            },
            {
              problem: '6×9',
              operand1: 6,
              operand2: 9,
              correctAnswer: 54,
              userAnswer: 52,
              isCorrect: false,
              visualizationShown: false,
              countsTowardScore: true,
            },
          ],
        },
      ];

      const frequencies = analyzeWrongAnswers(sessions);

      // 7 and 8 should NOT be counted (visualization was shown)
      expect(frequencies.get(7)).toBe(0);
      expect(frequencies.get(8)).toBe(0);

      // 6 and 9 SHOULD be counted (no visualization)
      expect(frequencies.get(6)).toBe(1);
      expect(frequencies.get(9)).toBe(1);
    });

    it('should only weight problems that counted toward score', () => {
      const sessions: Session[] = [
        {
          userId: 'user1',
          sessionId: 'session1',
          timestamp: Date.now(),
          score: 0,
          totalCards: 4,
          timedOut: false,
          cards: [
            // Wrong with visualization - ignore
            {
              problem: '2×3',
              operand1: 2,
              operand2: 3,
              correctAnswer: 6,
              userAnswer: 5,
              isCorrect: false,
              visualizationShown: true,
              countsTowardScore: false,
            },
            // Wrong without visualization - count
            {
              problem: '2×3',
              operand1: 2,
              operand2: 3,
              correctAnswer: 6,
              userAnswer: 5,
              isCorrect: false,
              visualizationShown: false,
              countsTowardScore: true,
            },
            // Wrong without visualization - count
            {
              problem: '2×4',
              operand1: 2,
              operand2: 4,
              correctAnswer: 8,
              userAnswer: 6,
              isCorrect: false,
              visualizationShown: false,
              countsTowardScore: true,
            },
          ],
        },
      ];

      const frequencies = analyzeWrongAnswers(sessions);

      // 2 appears in 3 wrong answers, but only 2 counted
      expect(frequencies.get(2)).toBe(2);
      // 3 appears in 2 wrong answers, but only 1 counted
      expect(frequencies.get(3)).toBe(1);
      // 4 appears in 1 wrong answer that counted
      expect(frequencies.get(4)).toBe(1);
    });
  });

  describe('Analytics Functions', () => {
    it('findWeakNumbers should exclude visualization cards', () => {
      const sessions: Session[] = [
        {
          userId: 'user1',
          sessionId: 'session1',
          timestamp: Date.now(),
          score: 0,
          totalCards: 3,
          timedOut: false,
          cards: [
            {
              problem: '7×8',
              operand1: 7,
              operand2: 8,
              correctAnswer: 56,
              userAnswer: 54,
              isCorrect: false,
              visualizationShown: true,
              countsTowardScore: false,
            },
            {
              problem: '6×9',
              operand1: 6,
              operand2: 9,
              correctAnswer: 54,
              userAnswer: 52,
              isCorrect: false,
              countsTowardScore: true,
            },
          ],
        },
      ];

      const weakNumbers = findWeakNumbers(sessions);

      // Should include 6 and 9, but not 7 and 8
      expect(weakNumbers).toContain(6);
      expect(weakNumbers).toContain(9);
      expect(weakNumbers).not.toContain(7);
      expect(weakNumbers).not.toContain(8);
    });

    it('findStrongNumbers should exclude visualization cards', () => {
      const sessions: Session[] = [
        {
          userId: 'user1',
          sessionId: 'session1',
          timestamp: Date.now(),
          score: 1,
          totalCards: 2,
          timedOut: false,
          cards: [
            {
              problem: '2×3',
              operand1: 2,
              operand2: 3,
              correctAnswer: 6,
              userAnswer: 6,
              isCorrect: true,
              visualizationShown: true,
              countsTowardScore: false,
            },
            {
              problem: '4×5',
              operand1: 4,
              operand2: 5,
              correctAnswer: 20,
              userAnswer: 20,
              isCorrect: true,
              countsTowardScore: true,
            },
          ],
        },
      ];

      const strongNumbers = findStrongNumbers(sessions);

      // Should include 4 and 5, but not 2 and 3
      expect(strongNumbers).toContain(4);
      expect(strongNumbers).toContain(5);
      expect(strongNumbers).not.toContain(2);
      expect(strongNumbers).not.toContain(3);
    });

    it('findMostMissedProblem should exclude visualization cards', () => {
      const sessions: Session[] = [
        {
          userId: 'user1',
          sessionId: 'session1',
          timestamp: Date.now(),
          score: 0,
          totalCards: 3,
          timedOut: false,
          cards: [
            {
              problem: '7×8',
              operand1: 7,
              operand2: 8,
              correctAnswer: 56,
              userAnswer: 54,
              isCorrect: false,
              visualizationShown: true,
              countsTowardScore: false,
            },
            {
              problem: '7×8',
              operand1: 7,
              operand2: 8,
              correctAnswer: 56,
              userAnswer: 54,
              isCorrect: false,
              visualizationShown: true,
              countsTowardScore: false,
            },
            {
              problem: '6×9',
              operand1: 6,
              operand2: 9,
              correctAnswer: 54,
              userAnswer: 52,
              isCorrect: false,
              countsTowardScore: true,
            },
          ],
        },
      ];

      const mostMissed = findMostMissedProblem(sessions);

      // Should be 6×9, not 7×8 (even though 7×8 appears twice)
      expect(mostMissed).toBe('6×9');
    });

    it('calculateNumberAccuracy should exclude visualization cards', () => {
      const sessions: Session[] = [
        {
          userId: 'user1',
          sessionId: 'session1',
          timestamp: Date.now(),
          score: 1,
          totalCards: 3,
          timedOut: false,
          cards: [
            // 2×3 wrong with visualization - ignore
            {
              problem: '2×3',
              operand1: 2,
              operand2: 3,
              correctAnswer: 6,
              userAnswer: 5,
              isCorrect: false,
              visualizationShown: true,
              countsTowardScore: false,
            },
            // 2×4 correct without visualization - count
            {
              problem: '2×4',
              operand1: 2,
              operand2: 4,
              correctAnswer: 8,
              userAnswer: 8,
              isCorrect: true,
              countsTowardScore: true,
            },
            // 2×5 wrong without visualization - count
            {
              problem: '2×5',
              operand1: 2,
              operand2: 5,
              correctAnswer: 10,
              userAnswer: 8,
              isCorrect: false,
              countsTowardScore: true,
            },
          ],
        },
      ];

      const accuracy = calculateNumberAccuracy(sessions, 2);

      // Should be 50% (1 correct out of 2 counted cards)
      // Not 33% (1 correct out of 3 total cards)
      expect(accuracy).toBe(50);
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle cards without countsTowardScore field (legacy data)', () => {
      const cards: Card[] = [
        {
          problem: '5×6',
          operand1: 5,
          operand2: 6,
          correctAnswer: 30,
          userAnswer: 30,
          isCorrect: true,
          // No countsTowardScore or visualizationShown field
        },
      ];

      // Should count toward score (backward compatible default)
      const score = cards.filter((c) => c.isCorrect && c.countsTowardScore !== false).length;
      expect(score).toBe(1);
    });

    it('should handle sessions with mixed legacy and new cards', () => {
      const sessions: Session[] = [
        {
          userId: 'user1',
          sessionId: 'session1',
          timestamp: Date.now(),
          score: 2,
          totalCards: 3,
          timedOut: false,
          cards: [
            // Legacy card (no countsTowardScore)
            {
              problem: '2×3',
              operand1: 2,
              operand2: 3,
              correctAnswer: 6,
              userAnswer: 5,
              isCorrect: false,
            },
            // New card with visualization
            {
              problem: '4×5',
              operand1: 4,
              operand2: 5,
              correctAnswer: 20,
              userAnswer: 18,
              isCorrect: false,
              visualizationShown: true,
              countsTowardScore: false,
            },
            // New card without visualization
            {
              problem: '6×7',
              operand1: 6,
              operand2: 7,
              correctAnswer: 42,
              userAnswer: 40,
              isCorrect: false,
              countsTowardScore: true,
            },
          ],
        },
      ];

      const frequencies = analyzeWrongAnswers(sessions);

      // Legacy card should count (2, 3)
      expect(frequencies.get(2)).toBe(1);
      expect(frequencies.get(3)).toBe(1);

      // Visualization card should not count (4, 5)
      expect(frequencies.get(4)).toBe(0);
      expect(frequencies.get(5)).toBe(0);

      // Normal new card should count (6, 7)
      expect(frequencies.get(6)).toBe(1);
      expect(frequencies.get(7)).toBe(1);
    });
  });
});
