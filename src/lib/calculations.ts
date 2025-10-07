/**
 * Calculation utilities for performance statistics and analytics.
 *
 * Provides functions for:
 * - Accuracy calculations
 * - Average time calculations
 * - Weak number identification
 * - Performance trends
 * - Statistical analysis
 */

import type { Session } from '../types';

/**
 * Calculates accuracy percentage.
 *
 * @param correct - Number of correct answers
 * @param total - Total number of questions
 * @returns Accuracy as a percentage (0-100)
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return (correct / total) * 100;
}

/**
 * Calculates average time per session.
 *
 * @param sessions - Array of sessions
 * @returns Average time in seconds, or 0 if no sessions have finish times
 */
export function calculateAverageTime(sessions: Session[]): number {
  const completedSessions = sessions.filter(
    (s) => s.finishTime !== undefined && !s.timedOut
  );

  if (completedSessions.length === 0) {
    return 0;
  }

  const totalTime = completedSessions.reduce((sum, session) => {
    return sum + (session.finishTime ?? 0);
  }, 0);

  return totalTime / completedSessions.length;
}

/**
 * Calculates average score across sessions.
 *
 * @param sessions - Array of sessions
 * @returns Average score percentage (0-100)
 */
export function calculateAverageScore(sessions: Session[]): number {
  if (sessions.length === 0) {
    return 0;
  }

  const totalAccuracy = sessions.reduce((sum, session) => {
    return sum + calculateAccuracy(session.score, session.totalCards);
  }, 0);

  return totalAccuracy / sessions.length;
}

/**
 * Finds the numbers that appear most frequently in wrong answers.
 * These are the "weak" numbers the user struggles with.
 *
 * @param sessions - Array of sessions
 * @param limit - Maximum number of weak numbers to return
 * @returns Array of numbers sorted by frequency (highest first)
 */
export function findWeakNumbers(sessions: Session[], limit = 5): number[] {
  const frequencies = new Map<number, number>();

  for (const session of sessions) {
    for (const card of session.cards) {
      if (!card.isCorrect) {
        const freq1 = frequencies.get(card.operand1) ?? 0;
        frequencies.set(card.operand1, freq1 + 1);

        const freq2 = frequencies.get(card.operand2) ?? 0;
        frequencies.set(card.operand2, freq2 + 1);
      }
    }
  }

  const sorted = Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([num]) => num);

  return sorted;
}

/**
 * Finds the numbers that appear most frequently in correct answers.
 * These are the "strong" numbers the user excels at.
 *
 * @param sessions - Array of sessions
 * @param limit - Maximum number of strong numbers to return
 * @returns Array of numbers sorted by frequency (highest first)
 */
export function findStrongNumbers(sessions: Session[], limit = 5): number[] {
  const frequencies = new Map<number, number>();

  for (const session of sessions) {
    for (const card of session.cards) {
      if (card.isCorrect) {
        const freq1 = frequencies.get(card.operand1) ?? 0;
        frequencies.set(card.operand1, freq1 + 1);

        const freq2 = frequencies.get(card.operand2) ?? 0;
        frequencies.set(card.operand2, freq2 + 1);
      }
    }
  }

  const sorted = Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([num]) => num);

  return sorted;
}

/**
 * Calculates the completion rate (finished vs timed out).
 *
 * @param sessions - Array of sessions
 * @returns Completion rate as a percentage (0-100)
 */
export function calculateCompletionRate(sessions: Session[]): number {
  if (sessions.length === 0) {
    return 0;
  }

  const completed = sessions.filter((s) => !s.timedOut).length;
  return (completed / sessions.length) * 100;
}

/**
 * Calculates improvement trend over time.
 * Returns positive number for improvement, negative for decline.
 *
 * @param sessions - Array of sessions (should be sorted by timestamp)
 * @param windowSize - Number of sessions to compare
 * @returns Percentage point change in average score
 */
export function calculateImprovementTrend(
  sessions: Session[],
  windowSize = 5
): number {
  if (sessions.length < windowSize * 2) {
    return 0;
  }

  const recentSessions = sessions.slice(0, windowSize);
  const olderSessions = sessions.slice(windowSize, windowSize * 2);

  const recentAvg = calculateAverageScore(recentSessions);
  const olderAvg = calculateAverageScore(olderSessions);

  return recentAvg - olderAvg;
}

/**
 * Calculates total number of cards answered.
 *
 * @param sessions - Array of sessions
 * @returns Total card count
 */
export function calculateTotalCards(sessions: Session[]): number {
  return sessions.reduce((sum, session) => sum + session.cards.length, 0);
}

/**
 * Calculates total correct answers across all sessions.
 *
 * @param sessions - Array of sessions
 * @returns Total correct count
 */
export function calculateTotalCorrect(sessions: Session[]): number {
  return sessions.reduce((sum, session) => sum + session.score, 0);
}

/**
 * Calculates the best (highest) score.
 *
 * @param sessions - Array of sessions
 * @returns Best score percentage (0-100)
 */
export function calculateBestScore(sessions: Session[]): number {
  if (sessions.length === 0) {
    return 0;
  }

  return Math.max(
    ...sessions.map((s) => calculateAccuracy(s.score, s.totalCards))
  );
}

/**
 * Calculates the worst (lowest) score.
 *
 * @param sessions - Array of sessions
 * @returns Worst score percentage (0-100)
 */
export function calculateWorstScore(sessions: Session[]): number {
  if (sessions.length === 0) {
    return 0;
  }

  return Math.min(
    ...sessions.map((s) => calculateAccuracy(s.score, s.totalCards))
  );
}

/**
 * Finds the most commonly missed problem (specific operand pair).
 *
 * @param sessions - Array of sessions
 * @returns Most missed problem string (e.g., "3×7") or null if none
 */
export function findMostMissedProblem(sessions: Session[]): string | null {
  const problemFrequencies = new Map<string, number>();

  for (const session of sessions) {
    for (const card of session.cards) {
      if (!card.isCorrect) {
        const freq = problemFrequencies.get(card.problem) ?? 0;
        problemFrequencies.set(card.problem, freq + 1);
      }
    }
  }

  if (problemFrequencies.size === 0) {
    return null;
  }

  let maxFreq = 0;
  let mostMissed: string | null = null;

  for (const [problem, freq] of problemFrequencies.entries()) {
    if (freq > maxFreq) {
      maxFreq = freq;
      mostMissed = problem;
    }
  }

  return mostMissed;
}

/**
 * Calculates accuracy for a specific number across all sessions.
 *
 * @param sessions - Array of sessions
 * @param number - The number to analyze (1-12)
 * @returns Accuracy percentage for problems involving this number
 */
export function calculateNumberAccuracy(
  sessions: Session[],
  number: number
): number {
  let total = 0;
  let correct = 0;

  for (const session of sessions) {
    for (const card of session.cards) {
      if (card.operand1 === number || card.operand2 === number) {
        total++;
        if (card.isCorrect) {
          correct++;
        }
      }
    }
  }

  return calculateAccuracy(correct, total);
}

/**
 * Gets accuracy data for all numbers (1-12).
 *
 * @param sessions - Array of sessions
 * @returns Map of number to accuracy percentage
 */
export function getNumberAccuracies(sessions: Session[]): Map<number, number> {
  const accuracies = new Map<number, number>();

  for (let i = 1; i <= 12; i++) {
    accuracies.set(i, calculateNumberAccuracy(sessions, i));
  }

  return accuracies;
}

/**
 * Calculates the current streak of perfect sessions.
 *
 * @param sessions - Array of sessions (sorted newest first)
 * @returns Number of consecutive perfect sessions
 */
export function calculatePerfectStreak(sessions: Session[]): number {
  let streak = 0;

  for (const session of sessions) {
    if (session.score === session.totalCards) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates statistics for a set of sessions.
 *
 * @param sessions - Array of sessions
 * @returns Comprehensive statistics object
 */
export function calculateSessionStats(sessions: Session[]) {
  return {
    totalSessions: sessions.length,
    totalCards: calculateTotalCards(sessions),
    totalCorrect: calculateTotalCorrect(sessions),
    averageScore: calculateAverageScore(sessions),
    averageTime: calculateAverageTime(sessions),
    bestScore: calculateBestScore(sessions),
    worstScore: calculateWorstScore(sessions),
    completionRate: calculateCompletionRate(sessions),
    weakNumbers: findWeakNumbers(sessions),
    strongNumbers: findStrongNumbers(sessions),
    mostMissedProblem: findMostMissedProblem(sessions),
    perfectStreak: calculatePerfectStreak(sessions),
    improvementTrend: calculateImprovementTrend(sessions),
  };
}
