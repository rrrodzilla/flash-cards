/**
 * Comprehensive tests for weighted randomization algorithm
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  analyzeWrongAnswers,
  generateWeightedProblem,
  generateSessionProblems,
} from './weightedRandom';
import type { Session, Card, Settings } from '../types';
import * as storage from '../storage';

describe('analyzeWrongAnswers', () => {
  it('should return empty frequencies for empty sessions array', () => {
    const frequencies = analyzeWrongAnswers([]);

    expect(frequencies.size).toBe(12);
    for (let i = 1; i <= 12; i++) {
      expect(frequencies.get(i)).toBe(0);
    }
  });

  it('should count frequencies from wrong answers', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 2,
        totalCards: 4,
        timedOut: false,
        cards: [
          {
            problem: '2×8',
            operand1: 2,
            operand2: 8,
            userAnswer: 15,
            correctAnswer: 16,
            isCorrect: false,
          },
          {
            problem: '8×3',
            operand1: 8,
            operand2: 3,
            userAnswer: 25,
            correctAnswer: 24,
            isCorrect: false,
          },
          {
            problem: '2×2',
            operand1: 2,
            operand2: 2,
            userAnswer: 4,
            correctAnswer: 4,
            isCorrect: true,
          },
          {
            problem: '7×8',
            operand1: 7,
            operand2: 8,
            userAnswer: 56,
            correctAnswer: 56,
            isCorrect: true,
          },
        ] as Card[],
      },
    ];

    const frequencies = analyzeWrongAnswers(sessions);

    expect(frequencies.get(2)).toBe(1); // Appears in 2×8
    expect(frequencies.get(8)).toBe(2); // Appears in both 2×8 and 8×3
    expect(frequencies.get(3)).toBe(1); // Appears in 8×3
    expect(frequencies.get(7)).toBe(0); // Only in correct answer
    expect(frequencies.get(1)).toBe(0); // Not present
  });

  it('should aggregate frequencies across multiple sessions', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 1,
        totalCards: 2,
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
            problem: '4×5',
            operand1: 4,
            operand2: 5,
            userAnswer: 20,
            correctAnswer: 20,
            isCorrect: true,
          },
        ] as Card[],
      },
      {
        userId: 'user-1',
        sessionId: 'session-2',
        timestamp: Date.now(),
        score: 0,
        totalCards: 1,
        timedOut: false,
        cards: [
          {
            problem: '2×7',
            operand1: 2,
            operand2: 7,
            userAnswer: 13,
            correctAnswer: 14,
            isCorrect: false,
          },
        ] as Card[],
      },
    ];

    const frequencies = analyzeWrongAnswers(sessions);

    expect(frequencies.get(2)).toBe(2); // Appears in both wrong answers
    expect(frequencies.get(3)).toBe(1);
    expect(frequencies.get(7)).toBe(1);
  });

  it('should handle sessions with all correct answers', () => {
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

    const frequencies = analyzeWrongAnswers(sessions);

    for (let i = 1; i <= 12; i++) {
      expect(frequencies.get(i)).toBe(0);
    }
  });

  it('should handle invalid sessions array', () => {
    const frequencies = analyzeWrongAnswers(null as unknown as Session[]);

    expect(frequencies.size).toBe(12);
    for (let i = 1; i <= 12; i++) {
      expect(frequencies.get(i)).toBe(0);
    }
  });

  it('should skip sessions with missing cards', () => {
    const sessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 0,
        totalCards: 0,
        timedOut: false,
        cards: undefined as unknown as Card[],
      },
    ];

    const frequencies = analyzeWrongAnswers(sessions);

    for (let i = 1; i <= 12; i++) {
      expect(frequencies.get(i)).toBe(0);
    }
  });

  it('should skip cards with invalid operands', () => {
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
            problem: '13×14',
            operand1: 13,
            operand2: 14,
            userAnswer: 100,
            correctAnswer: 182,
            isCorrect: false,
          },
        ] as Card[],
      },
    ];

    const frequencies = analyzeWrongAnswers(sessions);

    for (let i = 1; i <= 12; i++) {
      expect(frequencies.get(i)).toBe(0);
    }
  });
});

describe('generateWeightedProblem', () => {
  it('should generate problem with operand1 from included numbers and operand2 from full range (1-12)', () => {
    const includedNumbers = [1, 2, 3, 4, 5];
    const frequencies = new Map<number, number>();

    for (let i = 1; i <= 12; i++) {
      frequencies.set(i, 0);
    }

    const problem = generateWeightedProblem(includedNumbers, frequencies);

    // operand1 should be from included numbers
    expect(problem.operand1).toBeGreaterThanOrEqual(1);
    expect(problem.operand1).toBeLessThanOrEqual(5);
    // operand2 should be from full range (1-12)
    expect(problem.operand2).toBeGreaterThanOrEqual(1);
    expect(problem.operand2).toBeLessThanOrEqual(12);
  });

  it('should use pure random when no wrong answers exist', () => {
    const includedNumbers = [1, 2, 3];
    const frequencies = new Map<number, number>();

    for (let i = 1; i <= 12; i++) {
      frequencies.set(i, 0);
    }

    const results = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const problem = generateWeightedProblem(includedNumbers, frequencies);
      results.add(`${problem.operand1}×${problem.operand2}`);
    }

    expect(results.size).toBeGreaterThan(1);
  });

  it('should favor numbers with higher frequencies', () => {
    const includedNumbers = [1, 2, 3, 4, 5];
    const frequencies = new Map<number, number>([
      [1, 0],
      [2, 100],
      [3, 0],
      [4, 0],
      [5, 0],
      [6, 0],
      [7, 0],
      [8, 0],
      [9, 0],
      [10, 0],
      [11, 0],
      [12, 0],
    ]);

    const counts = new Map<number, number>();
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const problem = generateWeightedProblem(includedNumbers, frequencies);
      counts.set(problem.operand1, (counts.get(problem.operand1) || 0) + 1);
      counts.set(problem.operand2, (counts.get(problem.operand2) || 0) + 1);
    }

    const count2 = counts.get(2) || 0;
    const count1 = counts.get(1) || 0;

    expect(count2).toBeGreaterThan(count1);
  });

  it('should throw error for empty includedNumbers', () => {
    const frequencies = new Map<number, number>();

    expect(() => generateWeightedProblem([], frequencies)).toThrow(
      'includedNumbers must be a non-empty array'
    );
  });

  it('should throw error for invalid includedNumbers', () => {
    const frequencies = new Map<number, number>();

    expect(() =>
      generateWeightedProblem(null as unknown as number[], frequencies)
    ).toThrow('includedNumbers must be a non-empty array');
  });

  it('should throw error for invalid frequencies', () => {
    const includedNumbers = [1, 2, 3];

    expect(() =>
      generateWeightedProblem(includedNumbers, null as unknown as Map<number, number>)
    ).toThrow('wrongAnswerFrequencies must be a Map');
  });

  it('should filter out invalid numbers from includedNumbers', () => {
    const includedNumbers = [1, 2, 13, 14, 0, -1];
    const frequencies = new Map<number, number>();

    for (let i = 1; i <= 12; i++) {
      frequencies.set(i, 0);
    }

    const problem = generateWeightedProblem(includedNumbers, frequencies);

    // operand1 should only be 1 or 2 (valid numbers from includedNumbers)
    expect([1, 2]).toContain(problem.operand1);
    // operand2 should be from full range (1-12)
    expect(problem.operand2).toBeGreaterThanOrEqual(1);
    expect(problem.operand2).toBeLessThanOrEqual(12);
  });

  it('should throw error if no valid numbers in includedNumbers', () => {
    const includedNumbers = [13, 14, 15];
    const frequencies = new Map<number, number>();

    expect(() => generateWeightedProblem(includedNumbers, frequencies)).toThrow(
      'includedNumbers must contain at least one valid number'
    );
  });

  it('should handle single number in includedNumbers', () => {
    const includedNumbers = [7];
    const frequencies = new Map<number, number>();

    for (let i = 1; i <= 12; i++) {
      frequencies.set(i, 0);
    }

    const problem = generateWeightedProblem(includedNumbers, frequencies);

    // operand1 should always be 7 (the only included number)
    expect(problem.operand1).toBe(7);
    // operand2 should be from full range (1-12)
    expect(problem.operand2).toBeGreaterThanOrEqual(1);
    expect(problem.operand2).toBeLessThanOrEqual(12);
  });
});

describe('generateSessionProblems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate correct number of problems', () => {
    const settings: Settings = {
      includedNumbers: [1, 2, 3, 4, 5],
      cardsPerSession: 10,
      timeLimit: 300,
    };

    vi.spyOn(storage, 'getLastNSessions').mockReturnValue([]);

    const problems = generateSessionProblems(settings, 'user-1');

    expect(problems).toHaveLength(10);
  });

  it('should generate unique problems', () => {
    const settings: Settings = {
      includedNumbers: [1, 2, 3, 4, 5],
      cardsPerSession: 20,
      timeLimit: 300,
    };

    vi.spyOn(storage, 'getLastNSessions').mockReturnValue([]);

    const problems = generateSessionProblems(settings, 'user-1');
    const problemKeys = new Set(problems.map((p) => p.problem));

    expect(problemKeys.size).toBe(problems.length);
  });

  it('should include all required fields in each problem', () => {
    const settings: Settings = {
      includedNumbers: [1, 2, 3],
      cardsPerSession: 5,
      timeLimit: 300,
    };

    vi.spyOn(storage, 'getLastNSessions').mockReturnValue([]);

    const problems = generateSessionProblems(settings, 'user-1');

    problems.forEach((problem) => {
      expect(problem).toHaveProperty('problem');
      expect(problem).toHaveProperty('operand1');
      expect(problem).toHaveProperty('operand2');
      expect(problem).toHaveProperty('correctAnswer');
      expect(problem.correctAnswer).toBe(problem.operand1 * problem.operand2);
    });
  });

  it('should use weighted randomization when wrong answers exist', () => {
    const settings: Settings = {
      includedNumbers: [1, 2, 3, 4, 5],
      cardsPerSession: 25,
      timeLimit: 300,
    };

    const mockSessions: Session[] = [
      {
        userId: 'user-1',
        sessionId: 'session-1',
        timestamp: Date.now(),
        score: 0,
        totalCards: 10,
        timedOut: false,
        cards: Array.from({ length: 10 }, () => ({
          problem: '2×2',
          operand1: 2,
          operand2: 2,
          userAnswer: 3,
          correctAnswer: 4,
          isCorrect: false,
        })) as Card[],
      },
    ];

    const spy = vi.spyOn(storage, 'getLastNSessions').mockReturnValue(mockSessions);

    const problems = generateSessionProblems(settings, 'user-1');

    expect(spy).toHaveBeenCalledWith('user-1', 3);
    expect(problems.length).toBeGreaterThan(0);

    const hasNumber2 = problems.some(p => p.operand1 === 2 || p.operand2 === 2);
    expect(hasNumber2).toBe(true);
  });

  it('should throw error for invalid settings', () => {
    expect(() =>
      generateSessionProblems(null as unknown as Settings, 'user-1')
    ).toThrow('Settings must be a valid object');
  });

  it('should throw error for invalid userId', () => {
    const settings: Settings = {
      includedNumbers: [1, 2, 3],
      cardsPerSession: 10,
      timeLimit: 300,
    };

    expect(() => generateSessionProblems(settings, '')).toThrow(
      'User ID must be a non-empty string'
    );
  });

  it('should throw error for empty includedNumbers', () => {
    const settings: Settings = {
      includedNumbers: [],
      cardsPerSession: 10,
      timeLimit: 300,
    };

    expect(() => generateSessionProblems(settings, 'user-1')).toThrow(
      'No numbers included in settings'
    );
  });

  it('should throw error for non-integer cardsPerSession', () => {
    const settings: Settings = {
      includedNumbers: [1, 2, 3],
      cardsPerSession: 10.5,
      timeLimit: 300,
    };

    expect(() => generateSessionProblems(settings, 'user-1')).toThrow(
      'cardsPerSession must be a positive integer'
    );
  });

  it('should throw error for negative cardsPerSession', () => {
    const settings: Settings = {
      includedNumbers: [1, 2, 3],
      cardsPerSession: -5,
      timeLimit: 300,
    };

    expect(() => generateSessionProblems(settings, 'user-1')).toThrow(
      'cardsPerSession must be a positive integer'
    );
  });

  it('should throw error for cardsPerSession exceeding 1000', () => {
    const settings: Settings = {
      includedNumbers: [1, 2, 3],
      cardsPerSession: 1001,
      timeLimit: 300,
    };

    expect(() => generateSessionProblems(settings, 'user-1')).toThrow(
      'cardsPerSession cannot exceed 1000'
    );
  });

  it('should handle when requested cards exceed possible unique combinations', () => {
    const settings: Settings = {
      includedNumbers: [1, 2],
      cardsPerSession: 30,
      timeLimit: 300,
    };

    vi.spyOn(storage, 'getLastNSessions').mockReturnValue([]);

    const problems = generateSessionProblems(settings, 'user-1');

    // With 2 included numbers × 12 full range = 24 max unique combinations
    expect(problems.length).toBeLessThanOrEqual(24);
  });

  it('should call getLastNSessions with userId and count of 3', () => {
    const settings: Settings = {
      includedNumbers: [1, 2, 3],
      cardsPerSession: 5,
      timeLimit: 300,
    };

    const spy = vi.spyOn(storage, 'getLastNSessions').mockReturnValue([]);

    generateSessionProblems(settings, 'user-123');

    expect(spy).toHaveBeenCalledWith('user-123', 3);
  });

  it('should shuffle problems to randomize order', () => {
    const settings: Settings = {
      includedNumbers: [1, 2, 3, 4, 5],
      cardsPerSession: 20,
      timeLimit: 300,
    };

    vi.spyOn(storage, 'getLastNSessions').mockReturnValue([]);

    const problems1 = generateSessionProblems(settings, 'user-1');
    const problems2 = generateSessionProblems(settings, 'user-1');

    const keys1 = problems1.map((p) => p.problem).join(',');
    const keys2 = problems2.map((p) => p.problem).join(',');

    expect(keys1).not.toBe(keys2);
  });

  it('should respect includedNumbers setting for operand1 and use full range for operand2', () => {
    const settings: Settings = {
      includedNumbers: [7, 8, 9],
      cardsPerSession: 5,
      timeLimit: 300,
    };

    vi.spyOn(storage, 'getLastNSessions').mockReturnValue([]);

    const problems = generateSessionProblems(settings, 'user-1');

    problems.forEach((problem) => {
      // operand1 should be from includedNumbers
      expect([7, 8, 9]).toContain(problem.operand1);
      // operand2 should be from full range (1-12)
      expect(problem.operand2).toBeGreaterThanOrEqual(1);
      expect(problem.operand2).toBeLessThanOrEqual(12);
    });
  });

  it('should filter out invalid numbers from settings', () => {
    const settings: Settings = {
      includedNumbers: [1, 2, 13, 14],
      cardsPerSession: 3,
      timeLimit: 300,
    };

    vi.spyOn(storage, 'getLastNSessions').mockReturnValue([]);

    const problems = generateSessionProblems(settings, 'user-1');

    problems.forEach((problem) => {
      // operand1 should only be 1 or 2 (valid numbers from includedNumbers)
      expect([1, 2]).toContain(problem.operand1);
      // operand2 should be from full range (1-12)
      expect(problem.operand2).toBeGreaterThanOrEqual(1);
      expect(problem.operand2).toBeLessThanOrEqual(12);
    });
  });

  it('should throw error if no valid numbers after filtering', () => {
    const settings: Settings = {
      includedNumbers: [13, 14, 15],
      cardsPerSession: 5,
      timeLimit: 300,
    };

    expect(() => generateSessionProblems(settings, 'user-1')).toThrow(
      'Settings must include at least one valid number (1-12)'
    );
  });
});
