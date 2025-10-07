import React, { useEffect, useState } from 'react';

/**
 * ScoreDisplay component props interface
 */
export interface ScoreDisplayProps {
  /** Number of correct answers */
  score: number;
  /** Total number of questions */
  total: number;
  /** Enable count-up animation for score */
  animate?: boolean;
  /** Size of the display */
  size?: 'small' | 'medium' | 'large';
  /** Show percentage alongside score */
  showPercentage?: boolean;
}

/**
 * ScoreDisplay Component
 *
 * An engaging score display with color-coded feedback and animations.
 * Features count-up animation, performance-based colors, and encouraging messages.
 * Designed to motivate children ages 8-12 with positive reinforcement.
 *
 * Score tiers:
 * - 90%+: Green, "Amazing!" with 3 stars
 * - 75-89%: Blue, "Great job!"
 * - 60-74%: Yellow, "Good work!"
 * - <60%: Red, "Keep practicing!"
 *
 * @example
 * ```tsx
 * <ScoreDisplay
 *   score={18}
 *   total={20}
 *   animate={true}
 *   size="large"
 *   showPercentage={true}
 * />
 * ```
 */
export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  total,
  animate = true,
  size = 'medium',
  showPercentage = true,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    setIsAnimating(true);
    const duration = 1500;
    const steps = 60;
    const stepValue = score / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setDisplayScore(Math.round(stepValue * currentStep));
      } else {
        setDisplayScore(score);
        setIsAnimating(false);
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [score, animate]);

  const getScoreColor = () => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = () => {
    if (percentage >= 90) return 'from-green-50 to-green-100 border-green-200';
    if (percentage >= 75) return 'from-blue-50 to-blue-100 border-blue-200';
    if (percentage >= 60) return 'from-yellow-50 to-yellow-100 border-yellow-200';
    return 'from-red-50 to-red-100 border-red-200';
  };

  const getMessage = () => {
    if (percentage >= 90) return 'Amazing!';
    if (percentage >= 75) return 'Great job!';
    if (percentage >= 60) return 'Good work!';
    return 'Keep practicing!';
  };

  const sizeStyles = {
    small: {
      container: 'p-4',
      score: 'text-4xl',
      message: 'text-lg',
      stars: 'text-2xl',
    },
    medium: {
      container: 'p-6',
      score: 'text-6xl',
      message: 'text-2xl',
      stars: 'text-4xl',
    },
    large: {
      container: 'p-8',
      score: 'text-8xl',
      message: 'text-3xl',
      stars: 'text-6xl',
    },
  };

  return (
    <div
      className={`w-full bg-gradient-to-br ${getScoreBgColor()} border-2 rounded-3xl shadow-2xl ${
        sizeStyles[size].container
      } ${isAnimating ? 'animate-bounce' : ''}`}
      role="region"
      aria-label="Score display"
      aria-live="polite"
    >
      <div className="text-center">
        <div className={`font-bold ${sizeStyles[size].message} ${getScoreColor()} mb-4`}>
          {getMessage()}
        </div>

        <div className="flex items-center justify-center gap-4">
          <span className={`font-black ${sizeStyles[size].score} ${getScoreColor()} tabular-nums`}>
            {displayScore}
          </span>
          <span className={`font-bold ${sizeStyles[size].score} text-gray-400`}>/</span>
          <span className={`font-bold ${sizeStyles[size].score} text-gray-600 tabular-nums`}>
            {total}
          </span>
        </div>

        {showPercentage && (
          <div className={`mt-4 font-bold ${sizeStyles[size].message} ${getScoreColor()}`}>
            {percentage}% Correct
          </div>
        )}

        {percentage >= 90 && (
          <div className={`mt-6 flex items-center justify-center gap-2 ${sizeStyles[size].stars} animate-pulse`}>
            <span role="img" aria-label="star">⭐</span>
            <span role="img" aria-label="star">⭐</span>
            <span role="img" aria-label="star">⭐</span>
          </div>
        )}
      </div>
    </div>
  );
};
