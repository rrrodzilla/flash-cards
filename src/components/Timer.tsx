import React, { useEffect, useState } from 'react';

export interface TimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  isPaused?: boolean;
  variant?: 'linear' | 'circular';
  showNumbers?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Timer: React.FC<TimerProps> = ({
  totalSeconds,
  remainingSeconds,
  isPaused = false,
  variant = 'linear',
  showNumbers = true,
  size = 'medium',
}) => {
  const [pulseWarning, setPulseWarning] = useState(false);

  const percentage = (remainingSeconds / totalSeconds) * 100;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const isWarning = percentage <= 25 && percentage > 10;
  const isCritical = percentage <= 10;

  useEffect(() => {
    if (isCritical && !isPaused) {
      setPulseWarning(true);
      const interval = setInterval(() => {
        setPulseWarning((prev) => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setPulseWarning(false);
      return undefined;
    }
  }, [isCritical, isPaused]);

  const getColor = () => {
    if (isCritical) return 'red';
    if (isWarning) return 'yellow';
    return 'green';
  };

  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const textColorClasses = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };

  const sizeStyles = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl',
  };

  if (variant === 'circular') {
    const circleSize = size === 'small' ? 80 : size === 'medium' ? 120 : 160;
    const strokeWidth = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div
        className={`flex flex-col items-center justify-center ${
          pulseWarning ? 'animate-pulse' : ''
        }`}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="relative">
          <svg width={circleSize} height={circleSize} className="rotate-[-90deg]">
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${
                isCritical
                  ? 'text-red-500'
                  : isWarning
                  ? 'text-yellow-500'
                  : 'text-green-500'
              }`}
            />
          </svg>
          {showNumbers && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`font-bold ${sizeStyles[size]} ${
                  textColorClasses[getColor()]
                }`}
              >
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
        {isPaused && (
          <span className="mt-2 text-sm font-semibold text-gray-500">Paused</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`w-full ${pulseWarning ? 'animate-pulse' : ''}`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      {showNumbers && (
        <div className="flex items-center justify-between mb-2">
          <span className={`font-bold ${sizeStyles[size]} ${textColorClasses[getColor()]}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
          {isPaused && (
            <span className="text-sm font-semibold text-gray-500">Paused</span>
          )}
        </div>
      )}
      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            colorClasses[getColor()]
          } shadow-lg`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={remainingSeconds}
          aria-valuemin={0}
          aria-valuemax={totalSeconds}
          aria-label={`${remainingSeconds} seconds remaining`}
        />
      </div>
    </div>
  );
};
