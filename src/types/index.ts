/**
 * Core type definitions for the Flash Cards application
 */

export interface User {
  id: string;
  name: string;
  createdAt: number;
}

export interface Settings {
  includedNumbers: number[];
  cardsPerSession: number;
  timeLimit: number;
}

export interface Card {
  problem: string;
  operand1: number;
  operand2: number;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  visualizationShown?: boolean;
  countsTowardScore?: boolean; // false if user viewed visualization before answering
}

export interface Session {
  userId: string;
  sessionId: string;
  timestamp: number;
  cards: Card[];
  score: number;
  totalCards: number;
  finishTime?: number;
  timedOut: boolean;
}

export interface SessionSummary {
  totalSessions: number;
  averageScore: number;
  totalCards: number;
  correctAnswers: number;
  incorrectAnswers: number;
  bestScore: number;
  worstScore: number;
}

export interface NumberFrequency {
  number: number;
  frequency: number;
}

/**
 * Storage keys for localStorage
 */
export enum StorageKeys {
  USERS = 'flash-cards-users',
  SETTINGS = 'flash-cards-settings',
  SESSIONS = 'flash-cards-sessions',
  CURRENT_SESSION = 'flash-cards-current-session',
  CURRENT_USER = 'flash-cards-current-user',
}

/**
 * Default settings for the application
 */
export const DEFAULT_SETTINGS: Settings = {
  includedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  cardsPerSession: 20,
  timeLimit: 300, // 5 minutes in seconds
};
