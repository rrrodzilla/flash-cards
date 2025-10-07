/**
 * Weighted randomization algorithm for flash card generation.
 * Uses max heap to weight numbers based on wrong answer frequencies.
 */

import { MaxHeap } from './heap';
import type { Session, Card, Settings } from '../types';
import { getLastNSessions } from '../storage';

/**
 * Analyze wrong answers from sessions and count frequency of each number (1-12).
 *
 * @param sessions - Array of session objects to analyze
 * @returns Map of number to frequency count
 */
export function analyzeWrongAnswers(sessions: Session[]): Map<number, number> {
  const frequencies = new Map<number, number>();

  // Initialize all numbers 1-12 with frequency 0
  for (let i = 1; i <= 12; i++) {
    frequencies.set(i, 0);
  }

  // Count occurrences of each number in wrong answers
  for (const session of sessions) {
    for (const card of session.cards) {
      if (!card.isCorrect) {
        // Increment frequency for both operands
        const freq1 = frequencies.get(card.operand1) || 0;
        frequencies.set(card.operand1, freq1 + 1);

        const freq2 = frequencies.get(card.operand2) || 0;
        frequencies.set(card.operand2, freq2 + 1);
      }
    }
  }

  return frequencies;
}

/**
 * Generate a weighted random problem based on wrong answer frequencies.
 * Numbers with higher frequencies are more likely to be selected.
 *
 * @param includedNumbers - Array of numbers to include in problem generation
 * @param wrongAnswerFrequencies - Map of number to frequency from wrong answers
 * @returns Object with operand1 and operand2
 */
export function generateWeightedProblem(
  includedNumbers: number[],
  wrongAnswerFrequencies: Map<number, number>
): { operand1: number; operand2: number } {
  // Check if any wrong answers exist in included numbers
  const hasWrongAnswers = includedNumbers.some(num => {
    const freq = wrongAnswerFrequencies.get(num) || 0;
    return freq > 0;
  });

  // If no wrong answers, use pure random
  if (!hasWrongAnswers) {
    const operand1 = includedNumbers[Math.floor(Math.random() * includedNumbers.length)];
    const operand2 = includedNumbers[Math.floor(Math.random() * includedNumbers.length)];

    if (operand1 === undefined || operand2 === undefined) {
      throw new Error('Invalid included numbers array');
    }

    return { operand1, operand2 };
  }

  // Build max heap with frequencies
  const heap = new MaxHeap<number>();

  for (const num of includedNumbers) {
    const frequency = wrongAnswerFrequencies.get(num) || 0;
    // Add with frequency as priority
    // If frequency is 0, add with priority 0 so it's less likely to be selected
    heap.insert(num, frequency);
  }

  // Select operands using weighted random selection
  const operand1 = selectWeightedRandom(includedNumbers, wrongAnswerFrequencies);
  const operand2 = selectWeightedRandom(includedNumbers, wrongAnswerFrequencies);

  return { operand1, operand2 };
}

/**
 * Select a random number weighted by its frequency.
 * Higher frequency numbers have higher probability of selection.
 */
function selectWeightedRandom(
  numbers: number[],
  frequencies: Map<number, number>
): number {
  // Calculate total weight
  let totalWeight = 0;
  const weights: number[] = [];

  for (const num of numbers) {
    const freq = frequencies.get(num) || 0;
    // Use frequency + 1 to ensure even numbers with 0 frequency have some chance
    const weight = freq + 1;
    weights.push(weight);
    totalWeight += weight;
  }

  // Select random point in total weight range
  let random = Math.random() * totalWeight;

  // Find which number the random point falls into
  for (let i = 0; i < numbers.length; i++) {
    const weight = weights[i];
    if (weight === undefined) continue;

    random -= weight;
    if (random <= 0) {
      const num = numbers[i];
      if (num === undefined) {
        throw new Error('Invalid numbers array');
      }
      return num;
    }
  }

  // Fallback (should never reach here)
  const lastNum = numbers[numbers.length - 1];
  if (lastNum === undefined) {
    throw new Error('Invalid numbers array');
  }
  return lastNum;
}

/**
 * Generate a complete set of session problems using weighted randomization.
 *
 * @param settings - Settings object containing includedNumbers and cardsPerSession
 * @param userId - ID of the user for whom to generate problems
 * @returns Array of Card objects (without userAnswer filled)
 */
export function generateSessionProblems(
  settings: Settings,
  userId: string
): Omit<Card, 'userAnswer' | 'isCorrect'>[] {
  const { includedNumbers, cardsPerSession } = settings;

  // Validate settings
  if (!includedNumbers || includedNumbers.length === 0) {
    throw new Error('No numbers included in settings');
  }

  if (cardsPerSession <= 0) {
    throw new Error('Invalid cardsPerSession value');
  }

  // Get last 3 sessions for the user
  const recentSessions = getLastNSessions(userId, 3);

  // Analyze wrong answers
  const wrongAnswerFrequencies = analyzeWrongAnswers(recentSessions);

  // Generate problems
  const cards: Omit<Card, 'userAnswer' | 'isCorrect'>[] = [];
  const problemSet = new Set<string>();

  // Generate unique problems
  let attempts = 0;
  const maxAttempts = cardsPerSession * 10; // Prevent infinite loop

  while (cards.length < cardsPerSession && attempts < maxAttempts) {
    attempts++;

    const { operand1, operand2 } = generateWeightedProblem(
      includedNumbers,
      wrongAnswerFrequencies
    );

    // Create normalized problem key (ensure 2×3 and 3×2 are treated as different)
    const problemKey = `${operand1}×${operand2}`;

    // Skip if this exact problem already exists
    if (problemSet.has(problemKey)) {
      continue;
    }

    const correctAnswer = operand1 * operand2;

    cards.push({
      problem: problemKey,
      operand1,
      operand2,
      correctAnswer,
    });

    problemSet.add(problemKey);
  }

  // If we couldn't generate enough unique problems, fill remaining with random
  while (cards.length < cardsPerSession) {
    const operand1 = includedNumbers[Math.floor(Math.random() * includedNumbers.length)];
    const operand2 = includedNumbers[Math.floor(Math.random() * includedNumbers.length)];

    if (operand1 === undefined || operand2 === undefined) {
      throw new Error('Invalid included numbers array');
    }

    const problemKey = `${operand1}×${operand2}`;

    if (!problemSet.has(problemKey)) {
      cards.push({
        problem: problemKey,
        operand1,
        operand2,
        correctAnswer: operand1 * operand2,
      });
      problemSet.add(problemKey);
    }
  }

  // Shuffle the cards to ensure randomness in order
  return shuffleArray(cards);
}

/**
 * Fisher-Yates shuffle algorithm for array randomization.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    const other = shuffled[j];
    if (temp !== undefined && other !== undefined) {
      shuffled[i] = other;
      shuffled[j] = temp;
    }
  }

  return shuffled;
}
