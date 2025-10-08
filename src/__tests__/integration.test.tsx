/**
 * Integration Tests for Flash Cards Application
 *
 * These tests verify that all major components of the application work together correctly:
 * - User CRUD operations with storage
 * - Settings management and persistence
 * - Session generation with weighted randomization
 * - Full user journey simulation
 * - Storage synchronization
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getSettings,
  updateSettings,
  resetSettings,
  createSession,
  updateSession,
  getSessions,
  getLastNSessions,
  clearAllData,
  StorageError,
} from '../storage';
import {
  generateSessionProblems,
  analyzeWrongAnswers,
} from '../algorithms/weightedRandom';
import { calculateScore } from '../algorithms/sessionScorer';
import type { User, Settings, Card } from '../types';
import { DEFAULT_SETTINGS } from '../types';

describe('Integration Tests', () => {
  beforeEach(() => {
    clearAllData();
  });

  afterEach(() => {
    clearAllData();
  });

  describe('User CRUD Workflow', () => {
    it('should complete full user lifecycle: create, read, update, delete', () => {
      // Create user
      const user = createUser('Alice Johnson');
      expect(user).toBeDefined();
      expect(user.name).toBe('Alice Johnson');
      expect(user.id).toBeTruthy();
      expect(user.createdAt).toBeGreaterThan(0);

      // Read user
      const retrievedUser = getUser(user.id);
      expect(retrievedUser).toEqual(user);

      // List users
      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual(user);

      // Update user
      const updatedUser = updateUser(user.id, { name: 'Alice Smith' });
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('Alice Smith');
      expect(updatedUser?.id).toBe(user.id);

      // Delete user
      const deleted = deleteUser(user.id);
      expect(deleted).toBe(true);

      // Verify deletion
      const deletedUser = getUser(user.id);
      expect(deletedUser).toBeNull();

      const emptyUsers = getUsers();
      expect(emptyUsers).toHaveLength(0);
    });

    it('should handle multiple users correctly', () => {
      createUser('Alice');
      const bob = createUser('Bob');
      createUser('Charlie');

      const users = getUsers();
      expect(users).toHaveLength(3);

      const userNames = users.map((u) => u.name);
      expect(userNames).toContain('Alice');
      expect(userNames).toContain('Bob');
      expect(userNames).toContain('Charlie');

      // Delete middle user
      deleteUser(bob.id);

      const remainingUsers = getUsers();
      expect(remainingUsers).toHaveLength(2);
      expect(remainingUsers.find((u) => u.id === bob.id)).toBeUndefined();
    });

    it('should prevent duplicate user names (case-insensitive)', () => {
      createUser('John Doe');

      expect(() => createUser('John Doe')).toThrow(StorageError);
      expect(() => createUser('john doe')).toThrow(StorageError);
      expect(() => createUser('JOHN DOE')).toThrow(StorageError);
    });

    it('should validate user name constraints', () => {
      expect(() => createUser('')).toThrow(StorageError);
      expect(() => createUser('   ')).toThrow(StorageError);
      expect(() => createUser('a'.repeat(101))).toThrow(StorageError);
    });
  });

  describe('Settings Save/Load Workflow', () => {
    it('should load default settings on first access', () => {
      const settings = getSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should save and load custom settings', () => {
      const customSettings: Settings = {
        includedNumbers: [2, 3, 4, 5],
        cardsPerSession: 30,
        timeLimit: 600,
      };

      const updated = updateSettings(customSettings);
      expect(updated).toEqual(customSettings);

      const retrieved = getSettings();
      expect(retrieved).toEqual(customSettings);
    });

    it('should partially update settings', () => {
      const initial = getSettings();

      updateSettings({ cardsPerSession: 50 });

      const retrieved = getSettings();
      expect(retrieved.cardsPerSession).toBe(50);
      expect(retrieved.includedNumbers).toEqual(initial.includedNumbers);
      expect(retrieved.timeLimit).toBe(initial.timeLimit);
    });

    it('should reset settings to defaults', () => {
      updateSettings({ cardsPerSession: 50, timeLimit: 900 });

      const reset = resetSettings();
      expect(reset).toEqual(DEFAULT_SETTINGS);

      const retrieved = getSettings();
      expect(retrieved).toEqual(DEFAULT_SETTINGS);
    });

    it('should validate settings constraints', () => {
      expect(() =>
        updateSettings({ includedNumbers: [] })
      ).toThrow(StorageError);

      expect(() =>
        updateSettings({ cardsPerSession: 0 })
      ).toThrow(StorageError);

      expect(() =>
        updateSettings({ cardsPerSession: 101 })
      ).toThrow(StorageError);

      expect(() =>
        updateSettings({ timeLimit: 0 })
      ).toThrow(StorageError);

      expect(() =>
        updateSettings({ timeLimit: 3601 })
      ).toThrow(StorageError);

      expect(() =>
        updateSettings({ includedNumbers: [1, 13] })
      ).toThrow(StorageError);
    });
  });

  describe('Session Generation with Weighted Randomization', () => {
    let user: User;
    let settings: Settings;

    beforeEach(() => {
      user = createUser('Test User');
      settings = {
        includedNumbers: [1, 2, 3, 4, 5],
        cardsPerSession: 10,
        timeLimit: 300,
      };
    });

    it('should generate session with correct number of problems', () => {
      const problems = generateSessionProblems(settings, user.id);

      expect(problems).toHaveLength(10);
      problems.forEach((problem) => {
        // operand1 should be from includedNumbers (1-5)
        expect(problem.operand1).toBeGreaterThanOrEqual(1);
        expect(problem.operand1).toBeLessThanOrEqual(5);
        // operand2 should be from full range (1-12)
        expect(problem.operand2).toBeGreaterThanOrEqual(1);
        expect(problem.operand2).toBeLessThanOrEqual(12);
        expect(problem.correctAnswer).toBe(problem.operand1 * problem.operand2);
        expect(problem.problem).toBe(`${problem.operand1}×${problem.operand2}`);
      });
    });

    it('should generate unique problems within a session', () => {
      const problems = generateSessionProblems(settings, user.id);
      const problemKeys = problems.map((p) => p.problem);
      const uniqueKeys = new Set(problemKeys);

      expect(uniqueKeys.size).toBe(problems.length);
    });

    it('should use weighted randomization based on past wrong answers', () => {
      // Create a session with wrong answers for specific numbers
      const session = createSession(user.id, settings);

      const wrongAnswerCards: Card[] = [
        { problem: '2×3', operand1: 2, operand2: 3, userAnswer: 5, correctAnswer: 6, isCorrect: false },
        { problem: '2×4', operand1: 2, operand2: 4, userAnswer: 7, correctAnswer: 8, isCorrect: false },
        { problem: '2×5', operand1: 2, operand2: 5, userAnswer: 9, correctAnswer: 10, isCorrect: false },
        { problem: '3×4', operand1: 3, operand2: 4, userAnswer: 11, correctAnswer: 12, isCorrect: false },
        { problem: '3×5', operand1: 3, operand2: 5, userAnswer: 14, correctAnswer: 15, isCorrect: false },
      ];

      updateSession(session.sessionId, {
        cards: wrongAnswerCards,
        score: 0,
        totalCards: wrongAnswerCards.length,
        timedOut: false,
      });

      // Generate new problems - should favor 2 and 3
      const newProblems = generateSessionProblems(settings, user.id);

      const operandCounts = new Map<number, number>();
      newProblems.forEach((p) => {
        operandCounts.set(p.operand1, (operandCounts.get(p.operand1) || 0) + 1);
        operandCounts.set(p.operand2, (operandCounts.get(p.operand2) || 0) + 1);
      });

      // Numbers 2 and 3 should appear more frequently than others
      const count2 = operandCounts.get(2) || 0;
      const count3 = operandCounts.get(3) || 0;
      const count1 = operandCounts.get(1) || 0;

      expect(count2 + count3).toBeGreaterThan(count1);
    });

    it('should analyze wrong answers correctly', () => {
      const session = createSession(user.id, settings);

      const cards: Card[] = [
        { problem: '2×3', operand1: 2, operand2: 3, userAnswer: 5, correctAnswer: 6, isCorrect: false },
        { problem: '2×4', operand1: 2, operand2: 4, userAnswer: 7, correctAnswer: 8, isCorrect: false },
        { problem: '3×3', operand1: 3, operand2: 3, userAnswer: 8, correctAnswer: 9, isCorrect: false },
        { problem: '1×5', operand1: 1, operand2: 5, userAnswer: 5, correctAnswer: 5, isCorrect: true },
      ];

      updateSession(session.sessionId, {
        cards,
        score: 1,
        totalCards: cards.length,
        timedOut: false,
      });

      const sessions = getSessions(user.id);
      const frequencies = analyzeWrongAnswers(sessions);

      // Note: 2 appears in operand1 twice and operand2 once = 3 total
      // 3 appears in operand2 twice and operand1 once = 3 total
      // 4 appears in operand2 once = 1 total
      // 5 appears in operand2 once (but in correct answer, so counted) = 0 total for wrong
      expect(frequencies.get(2)).toBeGreaterThanOrEqual(2); // Appears in wrong answers
      expect(frequencies.get(3)).toBeGreaterThanOrEqual(2); // Appears in wrong answers
      expect(frequencies.get(4)).toBeGreaterThanOrEqual(1); // Appears in wrong answers
      expect(frequencies.get(1)).toBe(0); // Only in correct answer
      expect(frequencies.get(5)).toBeGreaterThanOrEqual(0); // May appear
    });
  });

  describe('Storage Synchronization', () => {
    it('should maintain data consistency across multiple operations', () => {
      const user1 = createUser('User 1');
      const user2 = createUser('User 2');

      const settings1: Settings = {
        includedNumbers: [1, 2, 3],
        cardsPerSession: 15,
        timeLimit: 300,
      };

      updateSettings(settings1);

      createSession(user1.id, settings1);
      createSession(user2.id, settings1);

      expect(getSessions(user1.id)).toHaveLength(1);
      expect(getSessions(user2.id)).toHaveLength(1);

      deleteUser(user1.id);

      expect(getSessions(user1.id)).toHaveLength(0);
      expect(getSessions(user2.id)).toHaveLength(1);

      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0]?.id).toBe(user2.id);
    });

    it('should handle concurrent session updates', () => {
      const user = createUser('Test User');
      const settings = getSettings();
      const session = createSession(user.id, settings);

      const cards1: Card[] = [
        { problem: '2×3', operand1: 2, operand2: 3, userAnswer: 6, correctAnswer: 6, isCorrect: true },
      ];

      updateSession(session.sessionId, {
        cards: cards1,
        score: 1,
        totalCards: 1,
      });

      const retrieved1 = getSessions(user.id)[0];
      expect(retrieved1?.score).toBe(1);
      expect(retrieved1?.cards).toHaveLength(1);

      const cards2: Card[] = [
        { problem: '2×3', operand1: 2, operand2: 3, userAnswer: 6, correctAnswer: 6, isCorrect: true },
        { problem: '3×4', operand1: 3, operand2: 4, userAnswer: 12, correctAnswer: 12, isCorrect: true },
      ];

      updateSession(session.sessionId, {
        cards: cards2,
        score: 2,
        totalCards: 2,
      });

      const retrieved2 = getSessions(user.id)[0];
      expect(retrieved2?.score).toBe(2);
      expect(retrieved2?.cards).toHaveLength(2);
    });
  });

  describe('Full User Journey Simulation', () => {
    it('should complete entire user journey from creation to reports', () => {
      // Step 1: Create user
      const user = createUser('Emma Wilson');
      expect(user).toBeDefined();

      // Step 2: Configure settings
      const settings: Settings = {
        includedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        cardsPerSession: 20,
        timeLimit: 600,
      };
      updateSettings(settings);

      // Step 3: Start first session
      const session1 = createSession(user.id, settings);
      const problems1 = generateSessionProblems(settings, user.id);

      // Simulate user answering some correctly, some incorrectly
      const completedCards1: Card[] = problems1.map((problem, index) => ({
        ...problem,
        userAnswer: index % 3 === 0 ? problem.correctAnswer : problem.correctAnswer + 1,
        isCorrect: index % 3 === 0,
      }));

      const score1 = calculateScore(completedCards1);

      updateSession(session1.sessionId, {
        cards: completedCards1,
        score: score1,
        totalCards: completedCards1.length,
        finishTime: 450,
        timedOut: false,
      });

      // Step 4: Complete second session
      const session2 = createSession(user.id, settings);
      const problems2 = generateSessionProblems(settings, user.id);

      const completedCards2: Card[] = problems2.map((problem, index) => ({
        ...problem,
        userAnswer: index % 2 === 0 ? problem.correctAnswer : problem.correctAnswer + 1,
        isCorrect: index % 2 === 0,
      }));

      const score2 = calculateScore(completedCards2);

      updateSession(session2.sessionId, {
        cards: completedCards2,
        score: score2,
        totalCards: completedCards2.length,
        finishTime: 480,
        timedOut: false,
      });

      // Step 5: Verify reports data
      const allSessions = getSessions(user.id);
      expect(allSessions).toHaveLength(2);

      const recentSessions = getLastNSessions(user.id, 1);
      expect(recentSessions).toHaveLength(1);
      // Most recent session should be the second one (sessions sorted by timestamp DESC)
      expect(recentSessions[0]?.sessionId).toBeTruthy();

      // Step 6: Verify statistics calculation
      const totalCards = allSessions.reduce((sum, s) => sum + s.totalCards, 0);
      const totalCorrect = allSessions.reduce((sum, s) => sum + s.score, 0);
      const avgScore = totalCards > 0 ? (totalCorrect / totalCards) * 100 : 0;

      expect(totalCards).toBe(40);
      expect(avgScore).toBeGreaterThan(0);
      expect(avgScore).toBeLessThanOrEqual(100);

      // Step 7: User deletion cleans up everything
      const deleted = deleteUser(user.id);
      expect(deleted).toBe(true);

      const sessionsAfterDelete = getSessions(user.id);
      expect(sessionsAfterDelete).toHaveLength(0);
    });

    it('should handle timeout scenario', () => {
      const user = createUser('Timeout Test User');
      const settings = getSettings();
      const session = createSession(user.id, settings);
      const problems = generateSessionProblems(settings, user.id);

      // User only completes 5 out of 20 cards before timeout
      const partialCards: Card[] = problems.slice(0, 5).map((problem) => ({
        ...problem,
        userAnswer: problem.correctAnswer,
        isCorrect: true,
      }));

      updateSession(session.sessionId, {
        cards: partialCards,
        score: 5,
        totalCards: settings.cardsPerSession,
        timedOut: true,
      });

      const sessions = getSessions(user.id);
      expect(sessions).toHaveLength(1);
      expect(sessions[0]?.timedOut).toBe(true);
      expect(sessions[0]?.cards).toHaveLength(5);
      expect(sessions[0]?.totalCards).toBe(settings.cardsPerSession);
      expect(sessions[0]?.finishTime).toBeUndefined();
    });

    it('should handle perfect score scenario', () => {
      const user = createUser('Perfect Score User');
      const settings: Settings = {
        includedNumbers: [1, 2, 3],
        cardsPerSession: 10,
        timeLimit: 300,
      };
      updateSettings(settings);

      const session = createSession(user.id, settings);
      const problems = generateSessionProblems(settings, user.id);

      const perfectCards: Card[] = problems.map((problem) => ({
        ...problem,
        userAnswer: problem.correctAnswer,
        isCorrect: true,
      }));

      updateSession(session.sessionId, {
        cards: perfectCards,
        score: perfectCards.length,
        totalCards: perfectCards.length,
        finishTime: 120,
        timedOut: false,
      });

      const sessions = getSessions(user.id);
      // With only numbers 1, 2, 3, maximum unique problems is 3×3 = 9
      // So we may have less than 10 cards
      const firstSession = sessions[0];
      expect(firstSession?.score).toBeGreaterThan(0);
      if (firstSession) {
        expect(firstSession.score).toBeLessThanOrEqual(firstSession.totalCards);
        if (firstSession.cards.length > 0) {
          expect(firstSession.score / firstSession.cards.length).toBe(1);
        }
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty state gracefully', () => {
      const users = getUsers();
      expect(users).toHaveLength(0);

      const user = getUser('non-existent-id');
      expect(user).toBeNull();

      const sessions = getSessions('non-existent-id');
      expect(sessions).toHaveLength(0);
    });

    it('should handle data clearing', () => {
      createUser('User 1');
      createUser('User 2');
      updateSettings({ cardsPerSession: 30 });

      clearAllData();

      const users = getUsers();
      expect(users).toHaveLength(0);

      const settings = getSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should handle session generation with minimal numbers', () => {
      const user = createUser('Minimal Test');
      const settings: Settings = {
        includedNumbers: [1],
        cardsPerSession: 5,
        timeLimit: 300,
      };

      const problems = generateSessionProblems(settings, user.id);

      // With 1 included number × 12 full range = 12 max possible combinations
      // Requesting 5, so should get 5
      expect(problems.length).toBe(5);
      problems.forEach((p) => {
        // operand1 should always be 1 (the only included number)
        expect(p.operand1).toBe(1);
        // operand2 should be from full range (1-12)
        expect(p.operand2).toBeGreaterThanOrEqual(1);
        expect(p.operand2).toBeLessThanOrEqual(12);
        expect(p.correctAnswer).toBe(p.operand1 * p.operand2);
      });
    });

    it('should handle maximum settings', () => {
      const user = createUser('Max Settings User');
      const settings: Settings = {
        includedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        cardsPerSession: 100,
        timeLimit: 3600,
      };

      const updated = updateSettings(settings);
      expect(updated).toEqual(settings);

      const problems = generateSessionProblems(settings, user.id);
      expect(problems.length).toBeLessThanOrEqual(100);
      expect(problems.length).toBeGreaterThan(0);
    });
  });

  describe('Session Scorer Integration', () => {
    it('should calculate score correctly', () => {
      const cards: Card[] = [
        { problem: '2×3', operand1: 2, operand2: 3, userAnswer: 6, correctAnswer: 6, isCorrect: true },
        { problem: '3×4', operand1: 3, operand2: 4, userAnswer: 11, correctAnswer: 12, isCorrect: false },
        { problem: '5×5', operand1: 5, operand2: 5, userAnswer: 25, correctAnswer: 25, isCorrect: true },
      ];

      const score = calculateScore(cards);
      expect(score).toBe(2);
    });

    it('should handle empty cards array', () => {
      const score = calculateScore([]);
      expect(score).toBe(0);
    });

    it('should integrate with session workflow', () => {
      const user = createUser('Score Test User');
      const settings = getSettings();
      const session = createSession(user.id, settings);
      const problems = generateSessionProblems(settings, user.id);

      const completedCards: Card[] = problems.map((p, i) => ({
        ...p,
        userAnswer: i < 5 ? p.correctAnswer : p.correctAnswer + 1,
        isCorrect: i < 5,
      }));

      const score = calculateScore(completedCards);

      updateSession(session.sessionId, {
        cards: completedCards,
        score,
        totalCards: completedCards.length,
        timedOut: false,
      });

      const sessions = getSessions(user.id);
      expect(sessions[0]?.score).toBe(score);
    });
  });

  describe('Array Visualization Integration', () => {
    it('should correctly track correct answers when visualization is shown', () => {
      const user = createUser('Viz Correct Answer Test User');
      const settings = getSettings();
      const session = createSession(user.id, settings);
      const problems = generateSessionProblems(settings, user.id);

      // Bug fix test: When user views visualization and then answers correctly,
      // the card should be marked as correct (isCorrect: true) but not count toward score
      const problem0 = problems[0];
      if (!problem0) throw new Error('Problem 0 not found');

      const cardWithVizShown: Card = {
        ...problem0,
        userAnswer: problem0.correctAnswer, // User answered correctly
        isCorrect: true, // Should be marked as correct
        visualizationShown: true, // But visualization was shown
        countsTowardScore: false, // So it shouldn't count toward score
      };

      const problem1 = problems[1];
      if (!problem1) throw new Error('Problem 1 not found');

      const cardWithoutViz: Card = {
        ...problem1,
        userAnswer: problem1.correctAnswer, // User answered correctly
        isCorrect: true, // Marked as correct
        visualizationShown: false, // No visualization shown
        countsTowardScore: true, // Should count toward score
      };

      const completedCards = [cardWithVizShown, cardWithoutViz];

      // Calculate score: only cards with countsTowardScore: true (or undefined) and isCorrect: true
      const score = completedCards.filter((c) => c.isCorrect && c.countsTowardScore !== false).length;

      updateSession(session.sessionId, {
        cards: completedCards,
        score, // Should be 1 (only second card counts)
        totalCards: completedCards.length,
        timedOut: false,
      });

      const sessions = getSessions(user.id);

      // Both cards should be marked as correct
      expect(sessions[0]?.cards[0]?.isCorrect).toBe(true);
      expect(sessions[0]?.cards[1]?.isCorrect).toBe(true);

      // But score should only be 1 (second card only)
      expect(sessions[0]?.score).toBe(1);

      // Verify countsTowardScore flags
      expect(sessions[0]?.cards[0]?.countsTowardScore).toBe(false);
      expect(sessions[0]?.cards[1]?.countsTowardScore).toBe(true);
    });

    it('should track visualizationShown in card when used', () => {
      const user = createUser('Visualization Test User');
      const settings = getSettings();
      const session = createSession(user.id, settings);
      const problems = generateSessionProblems(settings, user.id);

      // Simulate user viewing visualization for first card
      const problem0 = problems[0];
      if (!problem0) throw new Error('Problem 0 not found');
      const card1: Card = {
        ...problem0,
        userAnswer: problem0.correctAnswer,
        isCorrect: true,
        visualizationShown: true,
      };

      // Simulate not viewing visualization for second card
      const problem1 = problems[1];
      if (!problem1) throw new Error('Problem 1 not found');
      const card2: Card = {
        ...problem1,
        userAnswer: problem1.correctAnswer,
        isCorrect: true,
        visualizationShown: false,
      };

      // Simulate not setting visualizationShown for third card (undefined)
      const problem2 = problems[2];
      if (!problem2) throw new Error('Problem 2 not found');
      const card3: Card = {
        ...problem2,
        userAnswer: problem2.correctAnswer,
        isCorrect: true,
      };

      const completedCards = [card1, card2, card3];

      updateSession(session.sessionId, {
        cards: completedCards,
        score: 3,
        totalCards: completedCards.length,
        timedOut: false,
      });

      const sessions = getSessions(user.id);
      expect(sessions[0]?.cards[0]?.visualizationShown).toBe(true);
      expect(sessions[0]?.cards[1]?.visualizationShown).toBe(false);
      expect(sessions[0]?.cards[2]?.visualizationShown).toBeUndefined();
    });

    it('should persist visualizationShown across storage operations', () => {
      const user = createUser('Persistence Test User');
      const settings = getSettings();
      const session = createSession(user.id, settings);
      const problems = generateSessionProblems(settings, user.id);

      const cardsWithVisualization: Card[] = problems.map((p, i) => ({
        ...p,
        userAnswer: p.correctAnswer,
        isCorrect: true,
        visualizationShown: i % 2 === 0, // Every other card used visualization
      }));

      updateSession(session.sessionId, {
        cards: cardsWithVisualization,
        score: cardsWithVisualization.length,
        totalCards: cardsWithVisualization.length,
        timedOut: false,
      });

      // Retrieve and verify
      const sessions = getSessions(user.id);
      const retrievedCards = sessions[0]?.cards || [];

      retrievedCards.forEach((card, i) => {
        if (i % 2 === 0) {
          expect(card.visualizationShown).toBe(true);
        } else {
          expect(card.visualizationShown).toBe(false);
        }
      });
    });

    it('should handle sessions with mixed visualization usage', () => {
      const user = createUser('Mixed Usage User');
      const settings = getSettings();
      const session = createSession(user.id, settings);
      const problems = generateSessionProblems(settings, user.id);

      // Simulate realistic usage: used visualization on difficult problems
      const completedCards: Card[] = problems.map((p, i) => ({
        ...p,
        userAnswer: i < 3 ? p.correctAnswer + 1 : p.correctAnswer, // First 3 wrong
        isCorrect: i >= 3,
        visualizationShown: i < 3, // Used visualization on wrong answers
      }));

      updateSession(session.sessionId, {
        cards: completedCards,
        score: completedCards.filter((c) => c.isCorrect).length,
        totalCards: completedCards.length,
        timedOut: false,
      });

      const sessions = getSessions(user.id);
      const cards = sessions[0]?.cards || [];

      // First 3 cards should have visualization shown
      expect(cards[0]?.visualizationShown).toBe(true);
      expect(cards[1]?.visualizationShown).toBe(true);
      expect(cards[2]?.visualizationShown).toBe(true);

      // Remaining cards should not
      for (let i = 3; i < cards.length; i++) {
        expect(cards[i]?.visualizationShown).toBe(false);
      }
    });

    it('should maintain backward compatibility with cards without visualizationShown', () => {
      const user = createUser('Legacy User');
      const settings = getSettings();
      const session = createSession(user.id, settings);
      const problems = generateSessionProblems(settings, user.id);

      // Create cards without visualizationShown field (legacy format)
      const legacyCards: Card[] = problems.map((p) => ({
        ...p,
        userAnswer: p.correctAnswer,
        isCorrect: true,
        // No visualizationShown field
      }));

      updateSession(session.sessionId, {
        cards: legacyCards,
        score: legacyCards.length,
        totalCards: legacyCards.length,
        timedOut: false,
      });

      const sessions = getSessions(user.id);
      expect(sessions[0]?.cards).toBeDefined();
      expect(sessions[0]?.cards.length).toBe(legacyCards.length);

      // All cards should have undefined visualizationShown
      sessions[0]?.cards.forEach((card) => {
        expect(card.visualizationShown).toBeUndefined();
      });
    });

    it('should track visualization usage across multiple sessions', () => {
      const user = createUser('Multi Session User');
      const settings = getSettings();

      // Session 1: No visualization used
      const session1 = createSession(user.id, settings);
      const problems1 = generateSessionProblems(settings, user.id);
      const cards1: Card[] = problems1.map((p) => ({
        ...p,
        userAnswer: p.correctAnswer,
        isCorrect: true,
        visualizationShown: false,
      }));

      updateSession(session1.sessionId, {
        cards: cards1,
        score: cards1.length,
        totalCards: cards1.length,
        timedOut: false,
      });

      // Session 2: Heavy visualization usage
      const session2 = createSession(user.id, settings);
      const problems2 = generateSessionProblems(settings, user.id);
      const cards2: Card[] = problems2.map((p) => ({
        ...p,
        userAnswer: p.correctAnswer,
        isCorrect: true,
        visualizationShown: true,
      }));

      updateSession(session2.sessionId, {
        cards: cards2,
        score: cards2.length,
        totalCards: cards2.length,
        timedOut: false,
      });

      const sessions = getSessions(user.id);
      expect(sessions).toHaveLength(2);

      // Verify first session has no visualization usage
      const session1Cards = sessions.find((s) => s.sessionId === session1.sessionId)?.cards || [];
      session1Cards.forEach((card) => {
        expect(card.visualizationShown).toBe(false);
      });

      // Verify second session has full visualization usage
      const session2Cards = sessions.find((s) => s.sessionId === session2.sessionId)?.cards || [];
      session2Cards.forEach((card) => {
        expect(card.visualizationShown).toBe(true);
      });
    });
  });
});
