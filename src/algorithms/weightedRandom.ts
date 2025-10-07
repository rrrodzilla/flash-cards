/**
 * Weighted randomization algorithm for flash card generation.
 *
 * This module implements intelligent problem generation that adapts to user performance:
 * - Analyzes wrong answers from past sessions (up to 3 most recent)
 * - Uses max heap to prioritize frequently missed numbers
 * - Falls back to pure random when no wrong answers exist
 * - Ensures problem uniqueness within a session
 *
 * Algorithm:
 * 1. Extract wrong answer frequencies from last 3 sessions
 * 2. Build frequency map (number -> count of appearances in wrong answers)
 * 3. Use weighted random selection where higher frequency = higher probability
 * 4. Generate unique problems until session target is met
 */

import type { Session, Card, Settings } from '../types';
import { getLastNSessions } from '../storage';

/**
 * Analyze wrong answers from sessions and count frequency of each number (1-12).
 *
 * This function extracts both operands from incorrectly answered problems and counts
 * how many times each number appears. Numbers appearing in more wrong answers will
 * have higher frequencies, indicating areas where the user needs more practice.
 *
 * @param sessions - Array of session objects to analyze (typically last 3 sessions)
 * @returns Map of number (1-12) to frequency count
 *
 * @example
 * ```typescript
 * const sessions = getLastNSessions(userId, 3);
 * const frequencies = analyzeWrongAnswers(sessions);
 * // frequencies.get(2) might return 5 if number 2 appeared in 5 wrong answers
 * ```
 *
 * Time complexity: O(n * m) where n = number of sessions, m = cards per session
 * Space complexity: O(1) - fixed map size of 12 elements
 */
export function analyzeWrongAnswers(sessions: Session[]): Map<number, number> {
  if (!sessions || !Array.isArray(sessions)) {
    console.warn('[WeightedRandom] Invalid sessions array provided');
    return createEmptyFrequencyMap();
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
      if (!card || typeof card.isCorrect !== 'boolean') {
        continue;
      }

      if (!card.isCorrect) {
        if (isValidNumber(card.operand1)) {
          const freq1 = frequencies.get(card.operand1) || 0;
          frequencies.set(card.operand1, freq1 + 1);
        }

        if (isValidNumber(card.operand2)) {
          const freq2 = frequencies.get(card.operand2) || 0;
          frequencies.set(card.operand2, freq2 + 1);
        }
      }
    }
  }

  return frequencies;
}

/**
 * Helper function to create an empty frequency map with all numbers initialized to 0.
 */
function createEmptyFrequencyMap(): Map<number, number> {
  const map = new Map<number, number>();
  for (let i = 1; i <= 12; i++) {
    map.set(i, 0);
  }
  return map;
}

/**
 * Validates that a number is within the valid range (1-12) for multiplication tables.
 */
function isValidNumber(num: unknown): num is number {
  return typeof num === 'number' && Number.isInteger(num) && num >= 1 && num <= 12;
}

/**
 * Generate a weighted random problem based on wrong answer frequencies.
 *
 * This function creates a multiplication problem where:
 * - operand1 is selected from includedNumbers (from settings)
 * - operand2 is selected from full range 1-12, weighted by wrong answer frequencies
 *
 * Strategy:
 * - If no wrong answers exist in recent sessions -> pure random selection for operand2
 * - If wrong answers exist -> weighted selection based on frequency for operand2
 *
 * @param includedNumbers - Array of numbers to include as first operand (from settings)
 * @param wrongAnswerFrequencies - Map of number to frequency from wrong answers
 * @returns Object with operand1 and operand2 for the multiplication problem
 * @throws {Error} If includedNumbers is empty or invalid
 *
 * @example
 * ```typescript
 * const problem = generateWeightedProblem(
 *   [5],
 *   new Map([[2, 10], [3, 5], [8, 8], ...])
 * );
 * // Generates problems like 5×2, 5×8, 5×3 with 2, 8, 3 weighted highest
 * ```
 *
 * Time complexity: O(n) where n = 12 (fixed size for operand2 range)
 * Space complexity: O(1) for fixed-size arrays
 */
export function generateWeightedProblem(
  includedNumbers: number[],
  wrongAnswerFrequencies: Map<number, number>
): { operand1: number; operand2: number } {
  if (!includedNumbers || !Array.isArray(includedNumbers) || includedNumbers.length === 0) {
    throw new Error('includedNumbers must be a non-empty array');
  }

  if (!wrongAnswerFrequencies || !(wrongAnswerFrequencies instanceof Map)) {
    throw new Error('wrongAnswerFrequencies must be a Map');
  }

  const validNumbers = includedNumbers.filter(isValidNumber);
  if (validNumbers.length === 0) {
    throw new Error('includedNumbers must contain at least one valid number (1-12)');
  }

  // Full range for second operand (1-12)
  const fullRange = Array.from({ length: 12 }, (_, i) => i + 1);

  // Check if any numbers in the full range have wrong answers
  const hasWrongAnswers = fullRange.some(num => {
    const freq = wrongAnswerFrequencies.get(num) || 0;
    return freq > 0;
  });

  // Select first operand from included numbers
  const operand1 = validNumbers[Math.floor(Math.random() * validNumbers.length)];

  if (operand1 === undefined) {
    throw new Error('Failed to select random operand1');
  }

  // Select second operand from full range (1-12), weighted if wrong answers exist
  let operand2: number;
  if (!hasWrongAnswers) {
    operand2 = fullRange[Math.floor(Math.random() * fullRange.length)] as number;
  } else {
    operand2 = selectWeightedRandom(fullRange, wrongAnswerFrequencies);
  }

  return { operand1, operand2 };
}

/**
 * Select a random number weighted by its frequency using weighted random sampling.
 *
 * This implements a weighted random selection algorithm where each number's
 * probability of selection is proportional to its frequency + 1.
 * The +1 ensures that even numbers with 0 frequency have a small chance of selection.
 *
 * Algorithm:
 * 1. Calculate weight for each number: weight = frequency + 1
 * 2. Calculate total weight (sum of all weights)
 * 3. Generate random number in range [0, totalWeight)
 * 4. Iterate through numbers, subtracting weights until random <= 0
 * 5. Return the number where the random point landed
 *
 * @param numbers - Array of numbers to select from
 * @param frequencies - Map of number to frequency count
 * @returns Selected number
 * @throws {Error} If numbers array is empty or invalid
 *
 * @example
 * ```typescript
 * // Number 2 has frequency 10, number 3 has frequency 5, others have 0
 * // Weights: 2->11, 3->6, others->1
 * // Number 2 is 11x more likely than numbers with frequency 0
 * const selected = selectWeightedRandom([1,2,3,4,5], frequencies);
 * ```
 *
 * Time complexity: O(n) where n = numbers.length
 * Space complexity: O(n) for weights array
 */
function selectWeightedRandom(
  numbers: number[],
  frequencies: Map<number, number>
): number {
  if (numbers.length === 0) {
    throw new Error('Cannot select from empty numbers array');
  }

  let totalWeight = 0;
  const weights: number[] = [];

  for (const num of numbers) {
    const freq = frequencies.get(num) || 0;
    const weight = freq + 1;
    weights.push(weight);
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    throw new Error('Total weight cannot be zero');
  }

  let random = Math.random() * totalWeight;

  for (let i = 0; i < numbers.length; i++) {
    const weight = weights[i];
    if (weight === undefined) {
      continue;
    }

    random -= weight;
    if (random <= 0) {
      const num = numbers[i];
      if (num === undefined) {
        throw new Error('Invalid numbers array index');
      }
      return num;
    }
  }

  const lastNum = numbers[numbers.length - 1];
  if (lastNum === undefined) {
    throw new Error('Numbers array is invalid');
  }
  return lastNum;
}

/**
 * Generate a complete set of session problems using weighted randomization.
 *
 * This is the main entry point for problem generation. It:
 * 1. Fetches the user's last 3 sessions from storage
 * 2. Analyzes wrong answers to build frequency map
 * 3. Generates unique problems using weighted randomization
 * 4. Falls back to pure random if weighted generation can't produce enough unique problems
 * 5. Shuffles problems to randomize order
 *
 * @param settings - Settings object containing includedNumbers and cardsPerSession
 * @param userId - ID of the user for whom to generate problems
 * @returns Array of Card objects (without userAnswer and isCorrect fields - filled during session)
 * @throws {Error} If settings are invalid or userId is empty
 *
 * @example
 * ```typescript
 * const settings = { includedNumbers: [1,2,3,4,5], cardsPerSession: 20, timeLimit: 300 };
 * const problems = generateSessionProblems(settings, 'user-123');
 * // Returns 20 unique problems like: [{ problem: '2×3', operand1: 2, operand2: 3, correctAnswer: 6 }, ...]
 * ```
 *
 * Time complexity: O(n * log n) where n = cardsPerSession (due to shuffle)
 * Space complexity: O(n) for cards array and problem set
 */
export function generateSessionProblems(
  settings: Settings,
  userId: string
): Omit<Card, 'userAnswer' | 'isCorrect'>[] {
  if (!settings || typeof settings !== 'object') {
    throw new Error('Settings must be a valid object');
  }

  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('User ID must be a non-empty string');
  }

  const { includedNumbers, cardsPerSession } = settings;

  if (!includedNumbers || !Array.isArray(includedNumbers) || includedNumbers.length === 0) {
    throw new Error('No numbers included in settings');
  }

  if (!Number.isInteger(cardsPerSession) || cardsPerSession <= 0) {
    throw new Error('cardsPerSession must be a positive integer');
  }

  if (cardsPerSession > 1000) {
    throw new Error('cardsPerSession cannot exceed 1000');
  }

  const validNumbers = includedNumbers.filter(isValidNumber);
  if (validNumbers.length === 0) {
    throw new Error('Settings must include at least one valid number (1-12)');
  }

  // Max possible unique combinations: includedNumbers (operand1) × 12 (operand2 full range)
  const maxPossibleUnique = validNumbers.length * 12;
  if (cardsPerSession > maxPossibleUnique) {
    console.warn(
      `[WeightedRandom] Requested ${cardsPerSession} cards but only ${maxPossibleUnique} unique combinations possible. Generating maximum possible.`
    );
  }

  const recentSessions = getLastNSessions(userId, 3);
  const wrongAnswerFrequencies = analyzeWrongAnswers(recentSessions);

  const cards: Omit<Card, 'userAnswer' | 'isCorrect'>[] = [];
  const problemSet = new Set<string>();

  let attempts = 0;
  const maxAttempts = Math.min(cardsPerSession * 10, 10000);

  while (cards.length < cardsPerSession && attempts < maxAttempts) {
    attempts++;

    const { operand1, operand2 } = generateWeightedProblem(
      validNumbers,
      wrongAnswerFrequencies
    );

    const problemKey = `${operand1}×${operand2}`;

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

  // Fallback: generate remaining cards with pure random from full range for operand2
  const fullRange = Array.from({ length: 12 }, (_, i) => i + 1);

  while (cards.length < cardsPerSession) {
    const operand1 = validNumbers[Math.floor(Math.random() * validNumbers.length)];
    const operand2 = fullRange[Math.floor(Math.random() * fullRange.length)];

    if (operand1 === undefined || operand2 === undefined) {
      break;
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

    if (problemSet.size >= maxPossibleUnique) {
      break;
    }
  }

  if (cards.length < cardsPerSession) {
    console.warn(
      `[WeightedRandom] Could only generate ${cards.length} unique problems out of ${cardsPerSession} requested`
    );
  }

  return shuffleArray(cards);
}

/**
 * Fisher-Yates shuffle algorithm for array randomization.
 *
 * Shuffles array elements in-place (on a copy) to ensure random order.
 * This is the optimal unbiased shuffling algorithm.
 *
 * Algorithm:
 * 1. Start from the last element
 * 2. Pick a random index from 0 to current position
 * 3. Swap current element with randomly selected element
 * 4. Move to previous position and repeat
 *
 * @param array - Array to shuffle
 * @returns New shuffled array (original array is not modified)
 *
 * Time complexity: O(n) where n = array.length
 * Space complexity: O(n) for the copy
 */
function shuffleArray<T>(array: T[]): T[] {
  if (!array || !Array.isArray(array)) {
    return [];
  }

  if (array.length <= 1) {
    return [...array];
  }

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
