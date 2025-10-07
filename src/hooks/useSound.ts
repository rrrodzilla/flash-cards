/**
 * Custom hook for playing sound effects using Web Audio API.
 *
 * Features:
 * - Programmatic sound generation (no audio files needed)
 * - Correct/incorrect answer sounds
 * - Success/timeout sounds
 * - Muted by default (can be enabled via settings)
 * - Lightweight and performant
 */

import { useCallback, useRef, useEffect } from 'react';

interface UseSoundOptions {
  enabled?: boolean;
  volume?: number;
}

interface UseSoundReturn {
  playCorrect: () => void;
  playIncorrect: () => void;
  playSuccess: () => void;
  playTimeout: () => void;
  playClick: () => void;
}

/**
 * Custom hook for playing UI sound effects.
 *
 * @param options - Sound configuration
 * @returns Functions to play different sounds
 */
export function useSound({
  enabled = false,
  volume = 0.3,
}: UseSoundOptions = {}): UseSoundReturn {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((error) => {
          console.error('[useSound] Error closing AudioContext:', error);
        });
      }
    };
  }, [enabled]);

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      if (!enabled || !audioContextRef.current) {
        return;
      }

      try {
        const context = audioContextRef.current;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          context.currentTime + duration
        );

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + duration);
      } catch (error) {
        console.error('[useSound] Error playing tone:', error);
      }
    },
    [enabled, volume]
  );

  const playCorrect = useCallback(() => {
    playTone(523.25, 0.1);
    setTimeout(() => playTone(659.25, 0.15), 80);
  }, [playTone]);

  const playIncorrect = useCallback(() => {
    playTone(200, 0.2, 'sawtooth');
  }, [playTone]);

  const playSuccess = useCallback(() => {
    playTone(523.25, 0.1);
    setTimeout(() => playTone(659.25, 0.1), 100);
    setTimeout(() => playTone(783.99, 0.2), 200);
  }, [playTone]);

  const playTimeout = useCallback(() => {
    playTone(392.0, 0.15);
    setTimeout(() => playTone(349.23, 0.15), 150);
    setTimeout(() => playTone(293.66, 0.3), 300);
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(800, 0.05, 'square');
  }, [playTone]);

  return {
    playCorrect,
    playIncorrect,
    playSuccess,
    playTimeout,
    playClick,
  };
}

/**
 * Hook for playing a custom sequence of tones.
 * Useful for more complex sound patterns.
 */
export function useCustomSound(enabled = false, volume = 0.3) {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((error) => {
          console.error('[useCustomSound] Error closing AudioContext:', error);
        });
      }
    };
  }, [enabled]);

  const playSequence = useCallback(
    (
      notes: Array<{
        frequency: number;
        duration: number;
        type?: OscillatorType;
        delay?: number;
      }>
    ) => {
      if (!enabled || !audioContextRef.current) {
        return;
      }

      let cumulativeDelay = 0;

      notes.forEach(({ frequency, duration, type = 'sine', delay = 0 }) => {
        cumulativeDelay += delay;

        setTimeout(() => {
          try {
            if (!audioContextRef.current) return;

            const context = audioContextRef.current;
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(volume, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.01,
              context.currentTime + duration
            );

            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + duration);
          } catch (error) {
            console.error('[useCustomSound] Error playing note:', error);
          }
        }, cumulativeDelay);
      });
    },
    [enabled, volume]
  );

  return { playSequence };
}
