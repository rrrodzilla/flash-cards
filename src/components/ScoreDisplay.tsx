import React, { useEffect, useState } from 'react';

export interface ScoreDisplayProps {
  score: number;
  total: number;
  animate?: boolean;
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
}

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

  const getEmoji = () => {
    if (percentage >= 90) return '🌟';
    if (percentage >= 75) return '😊';
    if (percentage >= 60) return '🙂';
    return '💪';
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
      emoji: 'text-4xl',
    },
    medium: {
      container: 'p-6',
      score: 'text-6xl',
      message: 'text-2xl',
      emoji: 'text-6xl',
    },
    large: {
      container: 'p-8',
      score: 'text-8xl',
      message: 'text-3xl',
      emoji: 'text-8xl',
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
        <div className={`${sizeStyles[size].emoji} mb-4 animate-bounce`} role="img" aria-label={getMessage()}>
          {getEmoji()}
        </div>

        <div className={`font-bold ${sizeStyles[size].message} ${getScoreColor()} mb-2`}>
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
          <div className="mt-6 flex items-center justify-center gap-2 text-2xl animate-pulse">
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>
        )}
      </div>
    </div>
  );
};
