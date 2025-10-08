/**
 * Custom hook for managing current flash card session state.
 *
 * Features:
 * - Track current session progress
 * - Manage cards and answers
 * - Auto-save to localStorage
 * - Calculate score in real-time
 * - Integration with storage layer
 */

import { useState, useCallback, useEffect } from 'react';
import type { Session, Card, Settings } from '../types';
import { StorageKeys } from '../types';
import {
  createSession,
  updateSession,
  getCurrentSession,
} from '../storage';
import { generateSessionProblems } from '../algorithms/weightedRandom';

interface UseSessionOptions {
  userId: string;
  settings: Settings;
  onComplete?: (session: Session) => void;
  onTimeout?: (session: Session) => void;
}

interface UseSessionReturn {
  session: Session | null;
  currentCardIndex: number;
  currentCard: Omit<Card, 'userAnswer' | 'isCorrect'> | null;
  isComplete: boolean;
  startSession: () => void;
  submitAnswer: (userAnswer: number) => void;
  endSession: (timedOut?: boolean) => void;
  resetSession: () => void;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

/**
 * Custom hook for managing flash card session.
 *
 * @param options - Session configuration
 * @returns Session state and control functions
 */
export function useSession({
  userId,
  settings,
  onComplete,
  onTimeout,
}: UseSessionOptions): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [problems, setProblems] = useState<Omit<Card, 'userAnswer' | 'isCorrect'>[]>(
    []
  );

  const loadExistingSession = useCallback(() => {
    const existing = getCurrentSession(userId);

    if (existing) {
      setSession(existing);
      setCurrentCardIndex(existing.cards.length);

      const completed = existing.cards.map((c) => ({
        problem: c.problem,
        operand1: c.operand1,
        operand2: c.operand2,
        correctAnswer: c.correctAnswer,
      }));

      const remaining = generateSessionProblems(settings, userId).slice(
        completed.length
      );

      setProblems([...completed, ...remaining]);
    }
  }, [userId, settings]);

  useEffect(() => {
    loadExistingSession();
  }, [loadExistingSession]);

  const startSession = useCallback(() => {
    const newProblems = generateSessionProblems(settings, userId);
    setProblems(newProblems);

    const newSession = createSession(userId, settings);
    setSession(newSession);
    setCurrentCardIndex(0);

    localStorage.setItem(StorageKeys.CURRENT_SESSION, newSession.sessionId);
  }, [userId, settings]);

  const submitAnswer = useCallback(
    (userAnswer: number) => {
      if (!session || currentCardIndex >= problems.length) {
        return;
      }

      const problem = problems[currentCardIndex];
      if (!problem) {
        return;
      }

      const isCorrect = userAnswer === problem.correctAnswer;

      const completedCard: Card = {
        ...problem,
        userAnswer,
        isCorrect,
      };

      const updatedCards = [...session.cards, completedCard];
      const updatedScore = updatedCards.filter((c) => c.isCorrect && c.countsTowardScore !== false).length;

      const updatedSession = updateSession(session.sessionId, {
        cards: updatedCards,
        score: updatedScore,
      });

      if (updatedSession) {
        setSession(updatedSession);
        setCurrentCardIndex(currentCardIndex + 1);

        if (currentCardIndex + 1 >= problems.length) {
          const finalSession = updateSession(updatedSession.sessionId, {
            finishTime: Math.floor((Date.now() - updatedSession.timestamp) / 1000),
            timedOut: false,
          });

          if (finalSession) {
            setSession(finalSession);
            localStorage.removeItem(StorageKeys.CURRENT_SESSION);
            onComplete?.(finalSession);
          }
        }
      }
    },
    [session, currentCardIndex, problems, onComplete]
  );

  const endSession = useCallback(
    (timedOut = false) => {
      if (!session) {
        return;
      }

      const finalSession = updateSession(session.sessionId, {
        timedOut,
        finishTime: timedOut
          ? undefined
          : Math.floor((Date.now() - session.timestamp) / 1000),
      });

      if (finalSession) {
        setSession(finalSession);
        localStorage.removeItem(StorageKeys.CURRENT_SESSION);

        if (timedOut) {
          onTimeout?.(finalSession);
        } else {
          onComplete?.(finalSession);
        }
      }
    },
    [session, onComplete, onTimeout]
  );

  const resetSession = useCallback(() => {
    setSession(null);
    setCurrentCardIndex(0);
    setProblems([]);
    localStorage.removeItem(StorageKeys.CURRENT_SESSION);
  }, []);

  const currentCard = problems[currentCardIndex] ?? null;
  const isComplete = session !== null && currentCardIndex >= problems.length;

  const progress = {
    completed: currentCardIndex,
    total: problems.length,
    percentage: problems.length > 0 ? (currentCardIndex / problems.length) * 100 : 0,
  };

  return {
    session,
    currentCardIndex,
    currentCard,
    isComplete,
    startSession,
    submitAnswer,
    endSession,
    resetSession,
    progress,
  };
}
