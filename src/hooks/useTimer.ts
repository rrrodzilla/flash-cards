/**
 * Countdown timer hook with start, pause, resume, and reset controls.
 *
 * Features:
 * - Countdown from initial time to zero
 * - Start, pause, resume, and reset functionality
 * - Callback on completion
 * - Accurate timing using timestamps instead of interval counting
 * - Auto-cleanup on unmount
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

/**
 * Custom hook for countdown timer with controls.
 *
 * @param options - Timer configuration
 * @param options.initialTime - Initial time in seconds
 * @param options.onComplete - Callback fired when timer reaches zero
 * @param options.autoStart - Whether to start timer automatically (default: false)
 * @returns Timer state and control functions
 */
export function useTimer({
  initialTime,
  onComplete,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(initialTime);
  const hasCompletedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    hasCompletedRef.current = false;
    startTimeRef.current = Date.now();
    pausedTimeRef.current = timeLeft > 0 ? timeLeft : initialTime;

    const targetTime = startTimeRef.current + pausedTimeRef.current * 1000;

    clearTimer();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((targetTime - now) / 1000));

      setTimeLeft(remaining);

      if (remaining === 0) {
        clearTimer();
        setIsRunning(false);

        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onComplete?.();
        }
      }
    }, 100);
  }, [isRunning, timeLeft, initialTime, clearTimer, onComplete]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) {
      return;
    }

    setIsPaused(true);
    setIsRunning(false);
    pausedTimeRef.current = timeLeft;
    clearTimer();
  }, [isRunning, isPaused, timeLeft, clearTimer]);

  const resume = useCallback(() => {
    if (isRunning || !isPaused) {
      return;
    }

    setIsPaused(false);
    setIsRunning(true);
    startTimeRef.current = Date.now();

    const targetTime = startTimeRef.current + pausedTimeRef.current * 1000;

    clearTimer();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((targetTime - now) / 1000));

      setTimeLeft(remaining);

      if (remaining === 0) {
        clearTimer();
        setIsRunning(false);

        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onComplete?.();
        }
      }
    }, 100);
  }, [isRunning, isPaused, clearTimer, onComplete]);

  const reset = useCallback(() => {
    clearTimer();
    setTimeLeft(initialTime);
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = null;
    pausedTimeRef.current = initialTime;
    hasCompletedRef.current = false;
  }, [initialTime, clearTimer]);

  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    timeLeft,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
  };
}

/**
 * Alternative hook for stopwatch (count up) instead of countdown.
 * Can be used for tracking elapsed time.
 */
export function useStopwatch(autoStart = false) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    startTimeRef.current = Date.now();

    clearTimer();

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current !== null) {
        const now = Date.now();
        const totalElapsed =
          pausedElapsedRef.current + Math.floor((now - startTimeRef.current) / 1000);
        setElapsed(totalElapsed);
      }
    }, 100);
  }, [isRunning, clearTimer]);

  const pause = useCallback(() => {
    if (!isRunning) {
      return;
    }

    setIsRunning(false);
    pausedElapsedRef.current = elapsed;
    clearTimer();
  }, [isRunning, elapsed, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setElapsed(0);
    setIsRunning(false);
    startTimeRef.current = null;
    pausedElapsedRef.current = 0;
  }, [clearTimer]);

  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    elapsed,
    isRunning,
    start,
    pause,
    reset,
  };
}
