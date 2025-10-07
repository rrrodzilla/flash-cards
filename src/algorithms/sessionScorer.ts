/**
 * Session scoring and performance analysis utilities.
 *
 * This module provides functions to calculate scores, generate session summaries,
 * and analyze user performance over time.
 */

import type { Session, Card, SessionSummary } from '../types';

/**
 * Calculate the score for a session based on correct answers.
 *
 * Score is simply the count of correct answers out of total cards.
 * The percentage can be calculated separately if needed.
 *
 * @param cards - Array of cards from a session
 * @returns Number of correct answers
 *
 * @example
 * ```typescript
 * const cards = [
 *   { problem: '2×3', operand1: 2, operand2: 3, userAnswer: 6, correctAnswer: 6, isCorrect: true },
 *   { problem: '4×5', operand1: 4, operand2: 5, userAnswer: 19, correctAnswer: 20, isCorrect: false }
 * ];
 * const score = calculateScore(cards); // Returns 1
 * ```
 *
 * Time complexity: O(n) where n = cards.length
 * Space complexity: O(1)
 */
export function calculateScore(cards: Card[]): number {
  if (!cards || !Array.isArray(cards)) {
    return 0;
  }

  return cards.reduce((score, card) => {
    if (card && card.isCorrect === true) {
      return score + 1;
    }
    return score;
  }, 0);
}

/**
 * Calculate the percentage score for a session.
 *
 * @param cards - Array of cards from a session
 * @returns Percentage score (0-100)
 *
 * @example
 * ```typescript
 * const percentage = calculatePercentage(cards); // Returns 50.0 if 1 out of 2 correct
 * ```
 *
 * Time complexity: O(n) where n = cards.length
 * Space complexity: O(1)
 */
export function calculatePercentage(cards: Card[]): number {
  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    return 0;
  }

  const score = calculateScore(cards);
  return (score / cards.length) * 100;
}

/**
 * Generate a comprehensive summary of a single session.
 *
 * Provides detailed statistics about session performance including:
 * - Total cards and score
 * - Correct/incorrect counts
 * - Percentage score
 * - Time taken (if completed before timeout)
 * - Whether session timed out
 *
 * @param session - Session object to summarize
 * @returns Object with session summary statistics
 *
 * @example
 * ```typescript
 * const summary = generateSessionSummary(session);
 * // {
 * //   totalCards: 20,
 * //   score: 18,
 * //   percentage: 90,
 * //   correctCount: 18,
 * //   incorrectCount: 2,
 * //   timedOut: false,
 * //   finishTime: 245
 * // }
 * ```
 *
 * Time complexity: O(n) where n = number of cards
 * Space complexity: O(1)
 */
export function generateSessionSummary(session: Session): {
  totalCards: number;
  score: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  timedOut: boolean;
  finishTime?: number;
  timestamp: number;
} {
  if (!session || typeof session !== 'object') {
    throw new Error('Invalid session object provided');
  }

  const cards = session.cards || [];
  const score = calculateScore(cards);
  const percentage = calculatePercentage(cards);
  const correctCount = score;
  const incorrectCount = cards.length - score;

  return {
    totalCards: session.totalCards || cards.length,
    score,
    percentage,
    correctCount,
    incorrectCount,
    timedOut: session.timedOut || false,
    finishTime: session.finishTime,
    timestamp: session.timestamp,
  };
}

/**
 * Generate aggregate statistics across multiple sessions.
 *
 * Analyzes performance across multiple sessions to provide:
 * - Total session count
 * - Average score (mean percentage)
 * - Total cards attempted
 * - Total correct/incorrect answers
 * - Best and worst scores
 *
 * @param sessions - Array of session objects to analyze
 * @returns SessionSummary object with aggregate statistics
 *
 * @example
 * ```typescript
 * const sessions = getLastNSessions(userId, 10);
 * const summary = generateAggregateStats(sessions);
 * // {
 * //   totalSessions: 10,
 * //   averageScore: 85.5,
 * //   totalCards: 200,
 * //   correctAnswers: 171,
 * //   incorrectAnswers: 29,
 * //   bestScore: 100,
 * //   worstScore: 65
 * // }
 * ```
 *
 * Time complexity: O(n * m) where n = sessions, m = average cards per session
 * Space complexity: O(1)
 */
export function generateAggregateStats(sessions: Session[]): SessionSummary {
  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      totalCards: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      bestScore: 0,
      worstScore: 0,
    };
  }

  let totalCards = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let bestScore = 0;
  let worstScore = 100;
  let totalPercentage = 0;

  for (const session of sessions) {
    if (!session || !session.cards) {
      continue;
    }

    const cards = session.cards;
    totalCards += cards.length;

    const score = calculateScore(cards);
    correctAnswers += score;
    incorrectAnswers += cards.length - score;

    const percentage = calculatePercentage(cards);
    totalPercentage += percentage;

    if (percentage > bestScore) {
      bestScore = percentage;
    }

    if (percentage < worstScore) {
      worstScore = percentage;
    }
  }

  const averageScore = sessions.length > 0 ? totalPercentage / sessions.length : 0;

  if (sessions.length === 0) {
    worstScore = 0;
  }

  return {
    totalSessions: sessions.length,
    averageScore: Math.round(averageScore * 10) / 10,
    totalCards,
    correctAnswers,
    incorrectAnswers,
    bestScore: Math.round(bestScore * 10) / 10,
    worstScore: Math.round(worstScore * 10) / 10,
  };
}

/**
 * Identify problem areas (numbers that are frequently answered incorrectly).
 *
 * Analyzes sessions to find which numbers (1-12) appear most often in wrong answers.
 * Returns sorted array with most problematic numbers first.
 *
 * @param sessions - Array of sessions to analyze
 * @param limit - Maximum number of problem areas to return (default: 5)
 * @returns Array of [number, frequency] tuples sorted by frequency (descending)
 *
 * @example
 * ```typescript
 * const problemAreas = identifyProblemAreas(sessions, 3);
 * // [[8, 15], [7, 12], [9, 10]]
 * // Number 8 appeared in 15 wrong answers, 7 in 12, 9 in 10
 * ```
 *
 * Time complexity: O(n * m * log k) where n = sessions, m = cards, k = limit
 * Space complexity: O(1) - fixed map size of 12 elements
 */
export function identifyProblemAreas(
  sessions: Session[],
  limit: number = 5
): Array<[number, number]> {
  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
    return [];
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    limit = 5;
  }

  const frequencies = new Map<number, number>();

  for (let i = 1; i <= 12; i++) {
    frequencies.set(i, 0);
  }

  for (const session of sessions) {
    if (!session || !session.cards || !Array.isArray(session.cards)) {
      continue;
    }

    for (const card of session.cards) {
      if (!card || card.isCorrect !== false) {
        continue;
      }

      if (typeof card.operand1 === 'number' && card.operand1 >= 1 && card.operand1 <= 12) {
        const freq = frequencies.get(card.operand1) || 0;
        frequencies.set(card.operand1, freq + 1);
      }

      if (typeof card.operand2 === 'number' && card.operand2 >= 1 && card.operand2 <= 12) {
        const freq = frequencies.get(card.operand2) || 0;
        frequencies.set(card.operand2, freq + 1);
      }
    }
  }

  const entries = Array.from(frequencies.entries());
  entries.sort((a, b) => b[1] - a[1]);

  return entries.slice(0, limit).filter(([_, freq]) => freq > 0);
}

/**
 * Calculate the average time to complete a session (for completed sessions only).
 *
 * @param sessions - Array of sessions to analyze
 * @returns Average finish time in seconds, or null if no completed sessions
 *
 * @example
 * ```typescript
 * const avgTime = calculateAverageCompletionTime(sessions);
 * // Returns 245 if average completion time is 245 seconds (4 minutes 5 seconds)
 * ```
 *
 * Time complexity: O(n) where n = sessions.length
 * Space complexity: O(1)
 */
export function calculateAverageCompletionTime(sessions: Session[]): number | null {
  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
    return null;
  }

  let totalTime = 0;
  let completedCount = 0;

  for (const session of sessions) {
    if (
      session &&
      session.finishTime !== undefined &&
      typeof session.finishTime === 'number' &&
      session.finishTime > 0 &&
      !session.timedOut
    ) {
      totalTime += session.finishTime;
      completedCount++;
    }
  }

  if (completedCount === 0) {
    return null;
  }

  return Math.round(totalTime / completedCount);
}

/**
 * Calculate improvement trend over time.
 *
 * Compares the average score of the first half of sessions to the second half.
 * Positive value indicates improvement, negative indicates decline.
 *
 * @param sessions - Array of sessions (should be sorted chronologically)
 * @returns Percentage point improvement (e.g., 15.5 means 15.5% improvement)
 *
 * @example
 * ```typescript
 * const improvement = calculateImprovementTrend(sessions);
 * // Returns 12.5 if average score improved from 75% to 87.5%
 * ```
 *
 * Time complexity: O(n) where n = sessions.length
 * Space complexity: O(1)
 */
export function calculateImprovementTrend(sessions: Session[]): number {
  if (!sessions || !Array.isArray(sessions) || sessions.length < 2) {
    return 0;
  }

  const midpoint = Math.floor(sessions.length / 2);
  const firstHalf = sessions.slice(0, midpoint);
  const secondHalf = sessions.slice(midpoint);

  const firstHalfStats = generateAggregateStats(firstHalf);
  const secondHalfStats = generateAggregateStats(secondHalf);

  const improvement = secondHalfStats.averageScore - firstHalfStats.averageScore;

  return Math.round(improvement * 10) / 10;
}
