import React, { useEffect, useState } from 'react';

/**
 * Confetti piece interface for animation
 */
interface ConfettiPiece {
  id: number;
  left: number;
  animationDuration: number;
  size: number;
  color: string;
  delay: number;
}

/**
 * ConfettiOverlay component props interface
 */
export interface ConfettiOverlayProps {
  /** Show or hide the confetti overlay */
  isActive: boolean;
  /** Duration in milliseconds before confetti auto-hides */
  duration?: number;
  /** Number of confetti pieces to render */
  pieceCount?: number;
  /** Callback when confetti animation completes */
  onComplete?: () => void;
}

/**
 * ConfettiOverlay Component
 *
 * A celebratory confetti animation overlay for session completion.
 * Features colorful animated confetti pieces falling from the top.
 * Designed to delight children ages 8-12 when they complete a session.
 *
 * @example
 * ```tsx
 * const [showConfetti, setShowConfetti] = useState(false);
 *
 * <ConfettiOverlay
 *   isActive={showConfetti}
 *   duration={3000}
 *   pieceCount={50}
 *   onComplete={() => setShowConfetti(false)}
 * />
 * ```
 */
export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({
  isActive,
  duration = 3000,
  pieceCount = 50,
  onComplete,
}) => {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!isActive) {
      setConfettiPieces([]);
      return;
    }

    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-indigo-500',
    ];

    const pieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 2 + Math.random() * 2,
      size: 8 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)] || 'bg-blue-500',
      delay: Math.random() * 0.5,
    }));

    setConfettiPieces(pieces);

    const timer = setTimeout(() => {
      setConfettiPieces([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, duration, pieceCount, onComplete]);

  if (!isActive || confettiPieces.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      role="presentation"
      aria-label="Celebration confetti"
    >
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute ${piece.color} rounded-sm opacity-90 animate-confettiFall`}
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animationDuration: `${piece.animationDuration}s`,
            animationDelay: `${piece.delay}s`,
            top: '-20px',
          }}
        />
      ))}
    </div>
  );
};
