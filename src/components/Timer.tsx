import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Timer component props interface
 */
export interface TimerProps {
  /** Total time allowed in seconds */
  totalSeconds: number;
  /** Current remaining time in seconds */
  remainingSeconds: number;
  /** Pause timer animations when true */
  isPaused?: boolean;
  /** Visual display variant */
  variant?: 'linear' | 'circular';
  /** Show time remaining as numbers */
  showNumbers?: boolean;
  /** Size of the timer */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Timer Component
 *
 * A visual countdown timer with linear and circular variants.
 * Features color-coded warnings (green > 25%, yellow 10-25%, red < 10%)
 * and pulsing animation when time is critical.
 * Designed for kids to easily understand time remaining.
 *
 * @example
 * ```tsx
 * <Timer
 *   totalSeconds={300}
 *   remainingSeconds={45}
 *   variant="circular"
 *   size="large"
 * />
 *
 * <Timer
 *   totalSeconds={60}
 *   remainingSeconds={30}
 *   variant="linear"
 *   isPaused={true}
 * />
 * ```
 */
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
        aria-label={`${minutes} minutes and ${seconds} seconds remaining`}
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
                } tabular-nums`}
              >
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
        {isPaused && (
          <Badge variant="secondary" className="mt-2 text-sm">
            Paused
          </Badge>
        )}
      </div>
    );
  }

  const progressBarColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div
      className={cn('w-full relative', pulseWarning && 'animate-pulse')}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${minutes} minutes and ${seconds} seconds remaining`}
    >
      <Progress
        value={percentage}
        className="h-10 bg-gray-200 shadow-inner"
        aria-valuenow={remainingSeconds}
        aria-valuemin={0}
        aria-valuemax={totalSeconds}
        aria-label={`${remainingSeconds} seconds remaining`}
        indicatorClassName={cn(
          'transition-all duration-1000 ease-linear shadow-lg',
          progressBarColors[getColor()]
        )}
      />
      {showNumbers && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'font-bold tabular-nums text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
              sizeStyles[size]
            )}
          >
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      )}
      {isPaused && (
        <div className="absolute top-1/2 right-2 -translate-y-1/2">
          <Badge variant="secondary" className="text-sm shadow-md">
            Paused
          </Badge>
        </div>
      )}
    </div>
  );
};
