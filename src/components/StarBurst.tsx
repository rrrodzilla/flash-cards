import React, { useEffect, useState } from 'react';

/**
 * StarBurst component props interface
 */
export interface StarBurstProps {
  /** Show or hide the star burst animation */
  isActive: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Number of stars to render */
  starCount?: number;
}

/**
 * StarBurst Component
 *
 * A delightful star burst animation for correct answers.
 * Creates an explosion of stars radiating from the center.
 * Designed to celebrate correct answers and engage children ages 8-12.
 *
 * @example
 * ```tsx
 * const [showStars, setShowStars] = useState(false);
 *
 * <StarBurst
 *   isActive={showStars}
 *   duration={1000}
 *   onComplete={() => setShowStars(false)}
 * />
 * ```
 */
export const StarBurst: React.FC<StarBurstProps> = ({
  isActive,
  onComplete,
  duration = 1000,
  starCount = 12,
}) => {
  const [stars, setStars] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setStars([]);
      return;
    }

    setStars(Array.from({ length: starCount }, (_, i) => i));

    const timer = setTimeout(() => {
      setStars([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, duration, starCount, onComplete]);

  if (!isActive || stars.length === 0) return null;

  return (
    <div
      className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
      role="presentation"
      aria-label="Star burst celebration"
    >
      {stars.map((i) => {
        const angle = (i / starCount) * 360;
        const distance = 120;
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance;

        return (
          <div
            key={i}
            className="absolute text-4xl animate-starBurst"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              animationDelay: `${i * 0.05}s`,
            }}
          >
            ⭐
          </div>
        );
      })}
    </div>
  );
};
