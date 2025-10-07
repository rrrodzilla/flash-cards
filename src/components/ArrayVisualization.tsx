import { useState, useEffect } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface ArrayVisualizationProps {
  operand1: number;
  operand2: number;
  correctAnswer: number;
  variant?: 'full' | 'compact';
  onComplete?: () => void;
}

/**
 * Visual array representation of a multiplication problem.
 *
 * Displays an animated grid of dots arranged in rows × columns to help
 * children understand what multiplication means conceptually. Supports
 * both full-size standalone visualizations and compact versions for
 * inline feedback.
 *
 * @example
 * ```tsx
 * <ArrayVisualization
 *   operand1={6}
 *   operand2={7}
 *   correctAnswer={42}
 *   variant="full"
 *   onComplete={() => console.log('Animation finished')}
 * />
 * ```
 *
 * Features:
 * - Adaptive sizing based on problem size
 * - Smooth animations with reduced motion support
 * - Accessibility: screen reader announcements, ARIA labels
 * - Mobile-optimized with touch-friendly sizing
 * - Symbolic representation for large problems (>100 dots)
 *
 * @param operand1 - First operand (number of rows)
 * @param operand2 - Second operand (number of columns)
 * @param correctAnswer - The product (operand1 × operand2)
 * @param variant - Display mode: 'full' for standalone, 'compact' for feedback
 * @param onComplete - Optional callback fired when animation completes
 */
export const ArrayVisualization: React.FC<ArrayVisualizationProps> = ({
  operand1,
  operand2,
  correctAnswer,
  variant = 'full',
  onComplete,
}) => {
  const [visibleDots, setVisibleDots] = useState(0);
  const [showTotal, setShowTotal] = useState(false);
  const [showEquation, setShowEquation] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const totalDots = operand1 * operand2;
  const isLargeProblem = totalDots > 100;

  // Calculate dot size based on problem size and variant
  const getDotSize = () => {
    if (variant === 'compact') return 4;
    if (totalDots <= 20) return 10;
    if (totalDots <= 72) return 8;
    return 6;
  };

  const dotSize = getDotSize();
  const gap = Math.max(2, dotSize / 2);

  // Animation effect
  useEffect(() => {
    // Reset animation state when props change
    setVisibleDots(0);
    setShowTotal(false);
    setShowEquation(false);

    if (prefersReducedMotion) {
      // Show everything immediately if reduced motion is preferred
      setVisibleDots(totalDots);
      setShowTotal(true);
      setShowEquation(true);
      onComplete?.();
      return;
    }

    const animationDuration = variant === 'compact' ? 1200 : 2500;
    const dotRevealTime = animationDuration * 0.6;
    const dotsPerFrame = Math.max(1, Math.floor(totalDots / 10));

    const dotInterval = setInterval(() => {
      setVisibleDots((prev) => {
        if (prev >= totalDots) {
          clearInterval(dotInterval);
          return totalDots;
        }
        return Math.min(prev + dotsPerFrame, totalDots);
      });
    }, dotRevealTime / 10);

    const totalTimer = setTimeout(() => setShowTotal(true), dotRevealTime + 200);
    const equationTimer = setTimeout(() => {
      setShowEquation(true);
      onComplete?.();
    }, animationDuration);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(totalTimer);
      clearTimeout(equationTimer);
    };
  }, [totalDots, prefersReducedMotion, variant, onComplete, operand1, operand2]);

  // Render symbolic representation for large problems
  if (isLargeProblem) {
    return (
      <div
        className={`bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-indigo-200 rounded-xl ${
          variant === 'compact' ? 'p-4' : 'p-6'
        }`}
        role="img"
        aria-label={`${operand1} groups of ${operand2} equals ${correctAnswer} total`}
      >
        <h3
          className={`font-bold text-gray-900 mb-3 ${
            variant === 'compact' ? 'text-lg' : 'text-xl'
          }`}
        >
          Understanding {operand1} × {operand2}
        </h3>

        <div className="space-y-4 text-center">
          <p
            className={`font-semibold text-gray-700 ${
              variant === 'compact' ? 'text-base' : 'text-lg'
            }`}
          >
            {operand1} groups of {operand2}
          </p>

          <div
            className={`${
              showTotal ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } transition-all duration-300`}
          >
            <div
              className={`font-black text-purple-600 ${
                variant === 'compact' ? 'text-4xl' : 'text-6xl'
              }`}
            >
              {correctAnswer}
            </div>
            <p className="text-gray-600 text-sm mt-1">dots total</p>
          </div>

          <div
            className={`font-black text-gray-900 ${
              variant === 'compact' ? 'text-2xl' : 'text-3xl'
            } ${
              showEquation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } transition-all duration-300`}
          >
            {operand1} × {operand2} = {correctAnswer}
          </div>
        </div>
      </div>
    );
  }

  // Render array of dots for normal-sized problems
  return (
    <div
      className={`bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-indigo-200 rounded-xl ${
        variant === 'compact' ? 'p-4' : 'p-6'
      }`}
      role="img"
      aria-label={`Showing ${operand1} rows of ${operand2} dots. Total: ${correctAnswer} dots. ${operand1} times ${operand2} equals ${correctAnswer}`}
    >
      <h3
        className={`font-bold text-gray-900 mb-2 ${
          variant === 'compact' ? 'text-lg' : 'text-xl'
        }`}
      >
        Understanding {operand1} × {operand2}
      </h3>

      <p
        className={`font-semibold text-gray-700 mb-4 ${
          variant === 'compact' ? 'text-sm' : 'text-lg'
        }`}
      >
        {operand1} groups of {operand2}:
      </p>

      <div
        className="flex flex-col items-center justify-center mb-4"
        style={{ gap: `${gap}px` }}
      >
        {Array.from({ length: operand1 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center"
            style={{ gap: `${gap}px` }}
          >
            {Array.from({ length: operand2 }).map((_, colIndex) => {
              const dotIndex = rowIndex * operand2 + colIndex;
              const isVisible = dotIndex < visibleDots;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`rounded-full bg-blue-500 transition-all duration-200 ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                  style={{
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                  }}
                  aria-hidden="true"
                />
              );
            })}
          </div>
        ))}
      </div>

      <div
        className={`text-center space-y-2 ${
          showTotal ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } transition-all duration-300`}
      >
        <p
          className={`font-black text-purple-600 ${
            variant === 'compact' ? 'text-xl' : 'text-2xl'
          }`}
        >
          Total: {correctAnswer} dots
        </p>
      </div>

      <div
        className={`text-center mt-3 font-black text-gray-900 ${
          variant === 'compact' ? 'text-2xl' : 'text-3xl'
        } ${
          showEquation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } transition-all duration-300`}
      >
        {operand1} × {operand2} = {correctAnswer}
      </div>
    </div>
  );
};
