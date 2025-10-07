/**
 * Comprehensive tests for session scoring utilities
 */

import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  calculatePercentage,
  generateSessionSummary,
  generateAggregateStats,
  identifyProblemAreas,
  calculateAverageCompletionTime,
  calculateImprovementTrend,
} from './sessionScorer';
import type { Session, Card } from '../types';

describe('calculateScore', () => {
  it('should calculate score correctly', () => {
    const cards: Card[] = [
      {
        problem: '2×3',
        operand1: 2,
        operand2: 3,
        userAnswer: 6,
        correctAnswer: 6,
        isCorrect: true,
      },
      {
        problem: '4×5',
        operand1: 4,
        operand2: 5,
        userAnswer: 19,
        correctAnswer: 20,
        isCorrect: false,
      },
      {
        problem: '7×8',
        operand1: 7,
        operand2: 8,
        userAnswer: 56,
        correctAnswer: 56,
        isCorrect: true,
      },
    ];

    expect(calculateScore(cards)).toBe(2);
  });

  it('should return 0 for empty array', () => {
    expect(calculateScore([])).toBe(0);
  });

  it('should return 0 for all incorrect answers', () => {
    const cards: Card[] = [
      {
        problem: '2×3',
        operand1: 2,
        operand2: 3,
        userAnswer: 5,
        correctAnswer: 6,
        isCorrect: false,
      },
      {
        problem: '4×5',
        operand1: 4,
        operand2: 5,
        userAnswer: 19,
        correctAnswer: 20,
        isCorrect: false,
      },
    ];

    expect(calculateScore(cards)).toBe(0);
  });

  it('should return full score for all correct answers', () => {
    const cards: Card[] = [
      {
        problem: '2×3',
        operand1: 2,
        operand2: 3,
        userAnswer: 6,
        correctAnswer: 6,
        isCorrect: true,
      },
      {
        problem: '4×5',
        operand1: 4,
        operand2: 5,
        userAnswer: 20,
        correctAnswer: 20,
        isCorrect: true,
      },
    ];

    expect(calculateScore(cards)).toBe(2);
  });

  it('should handle invalid cards array', () => {
    expect(calculateScore(null as unknown as Card[])).toBe(0);
    expect(calculateScore(undefined as unknown as Card[])).toBe(0);
  });

  it('should skip invalid card objects', () => {
    const cards = [
      {
        problem: '2×3',
        operand1: 2,
        operand2: 3,
        userAnswer: 6,
        correctAnswer: 6,
        isCorrect: true,
      },
      null,
      {
        problem: '4×5',
        operand1: 4,
        operand2: 5,
        userAnswer: 20,
        correctAnswer: 20,
        isCorrect: true,
      },
    ];

    expect(calculateScore(cards as Card[])).toBe(2);
  });
});

describe('calculatePercentage', () => {
  it('should calculate percentage correctly', () => {
    const cards: Card[] = [
      {
        problem: '2×3',
        operand1: 2,
        operand2: 3,
        userAnswer: 6,
        correctAnswer: 6,
        isCorrect: true,
      },
      {
        problem: '4×5',
        operand1: 4,
        operand2: 5,
        userAnswer: 19,
        correctAnswer: 20,
        isCorrect: false,
      },
    ];

    expect(calculatePercentage(cards)).toBe(50);
  });

  it('should return 0 for empty array', () => {
    expect(calculatePercentage([])).toBe(0);
  });

  it('should return 100 for all correct', () => {
    const cards: Card[] = [
      {
        problem: '2×3',
        operand1: 2,
        operand2: 3,
        userAnswer: 6,
        correctAnswer: 6,
        isCorrect: true,
      },
      {
        problem: '4×5',
        operand1: 4,
        operand2: 5,
        userAnswer: 20,
        correctAnswer: 20,
        isCorrect: true,
      },
    ];

    expect(calculatePercentage(cards)).toBe(100);
  });

  it('should return 0 for all incorrect', () => {
    const cards: Card[] = [
      {
        problem: '2×3',
        operand1: 2,
        operand2: 3,
        userAnswer: 5,
        correctAnswer: 6,
        isCorrect: false,
      },
    ];

    expect(calculatePercentage(cards)).toBe(0);
  });

  it('should handle invalid input', () => {
    expect(calculatePercentage(null as unknown as Card[])).toBe(0);
  });
});

describe('generateSessionSummary', () => {
  it('should generate complete summary', () => {
    const session: Session = {
      userId: 'user-1',
      sessionId: 'session-1',
      timestamp: 1234567890,
      score: 3,
      totalCards: 5,
      timedOut: false,
      finishTime: 120,
      cards: [
        {
          problem: '2×3',
          operand1: 2,
          operand2: 3,
          userAnswer: 6,
          correctAnswer: 6,
          isCorrect: true,
        },
        {
          problem: '4×5',
          operand1: 4,
          operand2: 5,
          userAnswer: 19,
          correctAnswer: 20,
          isCorrect: false,
        },
        {
          problem: '7×8',
          operand1: 7,
          operand2: 8,
          userAnswer: 56,
          correctAnswer: 56,
          isCorrect: true,
        },
        {
          problem: '3×3',
          operand1: 3,
          operand2: 3,
          userAnswer: 9,
          correctAnswer: 9,
          isCorrect: true,
        },
        {
          problem: '6×7',
          operand1: 6,
          operand2: 7,
          userAnswer: 40,
          correctAnswer: 42,
          isCorrect: false,
        },
      ] as Card[],
    };

    const summary = generateSessionSummary(session);

    expect(summary.totalCards).toBe(5);
    expect(summary.score).toBe(3);
    expect(summary.percentage).toBe(60);
    expect(summary.correctCount).toBe(3);
    expect(summary.incorrectCount).toBe(2);
    expect(summary.timedOut).toBe(false);
    expect(summary.finishTime).toBe(120);
    expect(summary.timestamp).toBe(1234567890);
  });

  it('should handle timed out session', () => {
    const session: Session = {
      userId: 'user-1',
      sessionId: 'session-1',
      timestamp: 1234567890,
      score: 2,
      totalCards: 5,
      timedOut: true,
      cards: [
        {
          problem: '2×3',
          operand1: 2,
          operand2: 3,
          userAnswer: 6,
          correctAnswer: 6,
          isCorrect: true,
        },
        {
          problem: '4×5',
          operand1: 4,
          operand2: 5,
          userAnswer: 20,
          correctAnswer: 20,
          isCorrect: true,
        },
      ] as Card[],
    };

    const summary = generateSessionSummary(session);

    expect(summary.timedOut).toBe(true);
    expect(summary.finishTime).toBeUndefined();
  });

  it('should throw error for invalid session', () => {
    expect(() => generateSessionSummary(null as unknown as Session)).toThrow(
      'Invalid session object provided'
    );
  });

  it('should handle session with empty cards', () => {
    const session: Session = {
      userId: 'user-1',
      sessionId: 'session-1',
      timestamp: 1234567890,
      score: 0,
      totalCards: 0,
      timedOut: false,
      cards: [],
    };

    const summary = generateSessionSummary(session);

    expect(summary.score).toBe(0);
    expect(summary.percentage).toBe(0);
  });
});

describe('generateAggregateStats', () => {
  it('should calculate aggregate statistics correctly', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 8,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 8,
        })) as Card[],
      },
      {
        userId: 'user-1',
        sessionId: 'session-2',
        timestamp: Date.now(),
        score: 6,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 6,
        })) as Card[],
      },
    ];

    const stats = generateAggregateStats(sessions);

    expect(stats.totalSessions).toBe(2);
    expect(stats.totalCards).toBe(20);
    expect(stats.correctAnswers).toBe(14);
    expect(stats.incorrectAnswers).toBe(6);
    expect(stats.averageScore).toBe(70);
    expect(stats.bestScore).toBe(80);
    expect(stats.worstScore).toBe(60);
  });

  it('should return zero stats for empty array', () => {
    const stats = generateAggregateStats([]);

    expect(stats.totalSessions).toBe(0);
    expect(stats.averageScore).toBe(0);
    expect(stats.totalCards).toBe(0);
    expect(stats.correctAnswers).toBe(0);
    expect(stats.incorrectAnswers).toBe(0);
    expect(stats.bestScore).toBe(0);
    expect(stats.worstScore).toBe(0);
  });

  it('should handle single session', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 5,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 5,
        })) as Card[],
      },
    ];

    const stats = generateAggregateStats(sessions);

    expect(stats.totalSessions).toBe(1);
    expect(stats.averageScore).toBe(50);
    expect(stats.bestScore).toBe(50);
    expect(stats.worstScore).toBe(50);
  });

  it('should skip sessions with invalid cards', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 0,
        totalCards: 0,
        timedOut: false,
        cards: null as unknown as Card[],
      },
    ];

    const stats = generateAggregateStats(sessions);

    expect(stats.totalCards).toBe(0);
    expect(stats.correctAnswers).toBe(0);
  });

  it('should round scores to 1 decimal place', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 1,
        totalCards: 3,
        timedOut: false,
        cards: Array.from({ length: 3 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i === 0,
        })) as Card[],
      },
    ];

    const stats = generateAggregateStats(sessions);

    expect(stats.averageScore).toBe(33.3);
  });
});

describe('identifyProblemAreas', () => {
  it('should identify numbers in wrong answers', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 0,
        totalCards: 3,
        timedOut: false,
        cards: [
          {
            problem: '7×8',
            operand1: 7,
            operand2: 8,
            userAnswer: 54,
            correctAnswer: 56,
            isCorrect: false,
          },
          {
            problem: '8×9',
            operand1: 8,
            operand2: 9,
            userAnswer: 70,
            correctAnswer: 72,
            isCorrect: false,
          },
          {
            problem: '7×7',
            operand1: 7,
            operand2: 7,
            userAnswer: 48,
            correctAnswer: 49,
            isCorrect: false,
          },
        ] as Card[],
      },
    ];

    const problemAreas = identifyProblemAreas(sessions);

    expect(problemAreas).toContainEqual([7, 3]);
    expect(problemAreas).toContainEqual([8, 2]);
    expect(problemAreas).toContainEqual([9, 1]);
  });

  it('should sort by frequency descending', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 0,
        totalCards: 3,
        timedOut: false,
        cards: [
          {
            problem: '2×3',
            operand1: 2,
            operand2: 3,
            userAnswer: 5,
            correctAnswer: 6,
            isCorrect: false,
          },
          {
            problem: '2×4',
            operand1: 2,
            operand2: 4,
            userAnswer: 7,
            correctAnswer: 8,
            isCorrect: false,
          },
          {
            problem: '2×5',
            operand1: 2,
            operand2: 5,
            userAnswer: 9,
            correctAnswer: 10,
            isCorrect: false,
          },
        ] as Card[],
      },
    ];

    const problemAreas = identifyProblemAreas(sessions);

    expect(problemAreas[0]).toEqual([2, 3]);
  });

  it('should respect limit parameter', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 0,
        totalCards: 5,
        timedOut: false,
        cards: Array.from({ length: 5 }, (_, i) => ({
          problem: `${i + 1}×${i + 1}`,
          operand1: i + 1,
          operand2: i + 1,
          userAnswer: 0,
          correctAnswer: (i + 1) * (i + 1),
          isCorrect: false,
        })) as Card[],
      },
    ];

    const problemAreas = identifyProblemAreas(sessions, 3);

    expect(problemAreas.length).toBeLessThanOrEqual(3);
  });

  it('should return empty array for empty sessions', () => {
    const problemAreas = identifyProblemAreas([]);
    expect(problemAreas).toEqual([]);
  });

  it('should return empty array for sessions with all correct answers', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 2,
        totalCards: 2,
        timedOut: false,
        cards: [
          {
            problem: '2×3',
            operand1: 2,
            operand2: 3,
            userAnswer: 6,
            correctAnswer: 6,
            isCorrect: true,
          },
          {
            problem: '4×5',
            operand1: 4,
            operand2: 5,
            userAnswer: 20,
            correctAnswer: 20,
            isCorrect: true,
          },
        ] as Card[],
      },
    ];

    const problemAreas = identifyProblemAreas(sessions);
    expect(problemAreas).toEqual([]);
  });

  it('should filter out numbers with zero frequency', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 0,
        totalCards: 1,
        timedOut: false,
        cards: [
          {
            problem: '7×8',
            operand1: 7,
            operand2: 8,
            userAnswer: 54,
            correctAnswer: 56,
            isCorrect: false,
          },
        ] as Card[],
      },
    ];

    const problemAreas = identifyProblemAreas(sessions);

    expect(problemAreas.every(([_, freq]) => freq > 0)).toBe(true);
  });

  it('should handle invalid limit', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 0,
        totalCards: 1,
        timedOut: false,
        cards: [
          {
            problem: '2×3',
            operand1: 2,
            operand2: 3,
            userAnswer: 5,
            correctAnswer: 6,
            isCorrect: false,
          },
        ] as Card[],
      },
    ];

    const problemAreas1 = identifyProblemAreas(sessions, -1);
    const problemAreas2 = identifyProblemAreas(sessions, 0);

    expect(problemAreas1.length).toBeGreaterThan(0);
    expect(problemAreas2.length).toBeGreaterThan(0);
  });
});

describe('calculateAverageCompletionTime', () => {
  it('should calculate average completion time', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 10,
        totalCards: 10,
        timedOut: false,
        finishTime: 120,
        cards: [],
      },
      {
        userId: 'user-1',
        sessionId: 'session-2',
        timestamp: Date.now(),
        score: 10,
        totalCards: 10,
        timedOut: false,
        finishTime: 180,
        cards: [],
      },
    ];

    const avgTime = calculateAverageCompletionTime(sessions);

    expect(avgTime).toBe(150);
  });

  it('should return null for empty sessions array', () => {
    const avgTime = calculateAverageCompletionTime([]);
    expect(avgTime).toBeNull();
  });

  it('should ignore timed out sessions', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 10,
        totalCards: 10,
        timedOut: false,
        finishTime: 120,
        cards: [],
      },
      {
        userId: 'user-1',
        sessionId: 'session-2',
        timestamp: Date.now(),
        score: 5,
        totalCards: 10,
        timedOut: true,
        cards: [],
      },
    ];

    const avgTime = calculateAverageCompletionTime(sessions);

    expect(avgTime).toBe(120);
  });

  it('should ignore sessions without finishTime', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 10,
        totalCards: 10,
        timedOut: false,
        finishTime: 120,
        cards: [],
      },
      {
        userId: 'user-1',
        sessionId: 'session-2',
        timestamp: Date.now(),
        score: 10,
        totalCards: 10,
        timedOut: false,
        cards: [],
      },
    ];

    const avgTime = calculateAverageCompletionTime(sessions);

    expect(avgTime).toBe(120);
  });

  it('should return null if no completed sessions', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 5,
        totalCards: 10,
        timedOut: true,
        cards: [],
      },
    ];

    const avgTime = calculateAverageCompletionTime(sessions);

    expect(avgTime).toBeNull();
  });

  it('should round to nearest second', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 10,
        totalCards: 10,
        timedOut: false,
        finishTime: 100,
        cards: [],
      },
      {
        userId: 'user-1',
        sessionId: 'session-2',
        timestamp: Date.now(),
        score: 10,
        totalCards: 10,
        timedOut: false,
        finishTime: 101,
        cards: [],
      },
    ];

    const avgTime = calculateAverageCompletionTime(sessions);

    expect(Number.isInteger(avgTime)).toBe(true);
  });
});

describe('calculateImprovementTrend', () => {
  it('should calculate positive improvement', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now() - 4000,
        score: 5,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 5,
        })) as Card[],
      },
      {
        userId: 'user-1',
        sessionId: 'session-2',
        timestamp: Date.now() - 3000,
        score: 6,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 6,
        })) as Card[],
      },
      {
        userId: 'user-1',
        sessionId: 'session-3',
        timestamp: Date.now() - 2000,
        score: 8,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 8,
        })) as Card[],
      },
      {
        userId: 'user-1',
        sessionId: 'session-4',
        timestamp: Date.now() - 1000,
        score: 9,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 9,
        })) as Card[],
      },
    ];

    const improvement = calculateImprovementTrend(sessions);

    expect(improvement).toBeGreaterThan(0);
  });

  it('should calculate negative improvement (decline)', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now() - 2000,
        score: 9,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 9,
        })) as Card[],
      },
      {
        userId: 'user-1',
        sessionId: 'session-2',
        timestamp: Date.now() - 1000,
        score: 5,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 5,
        })) as Card[],
      },
    ];

    const improvement = calculateImprovementTrend(sessions);

    expect(improvement).toBeLessThan(0);
  });

  it('should return 0 for empty sessions', () => {
    const improvement = calculateImprovementTrend([]);
    expect(improvement).toBe(0);
  });

  it('should return 0 for single session', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 5,
        totalCards: 10,
        timedOut: false,
        cards: [],
      },
    ];

    const improvement = calculateImprovementTrend(sessions);

    expect(improvement).toBe(0);
  });

  it('should handle even number of sessions', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now() - 2000,
        score: 5,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 5,
        })) as Card[],
      },
      {
        userId: 'user-1',
        sessionId: 'session-2',
        timestamp: Date.now() - 1000,
        score: 8,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 8,
        })) as Card[],
      },
    ];

    const improvement = calculateImprovementTrend(sessions);

    expect(improvement).toBeGreaterThan(0);
  });

  it('should round to 1 decimal place', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now() - 2000,
        score: 1,
        totalCards: 3,
        timedOut: false,
        cards: Array.from({ length: 3 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i === 0,
        })) as Card[],
      },
      {
        userId: 'user-1',
        sessionId: 'session-2',
        timestamp: Date.now() - 1000,
        score: 2,
        totalCards: 3,
        timedOut: false,
        cards: Array.from({ length: 3 }, (_, i) => ({
          problem: `${i}×${i}`,
          operand1: i,
          operand2: i,
          userAnswer: i * i,
          correctAnswer: i * i,
          isCorrect: i < 2,
        })) as Card[],
      },
    ];

    const improvement = calculateImprovementTrend(sessions);

    const decimalPlaces = improvement.toString().split('.')[1]?.length || 0;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });
});
