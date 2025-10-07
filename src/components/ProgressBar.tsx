import React from 'react';

/**
 * ProgressBar component props interface
 */
export interface ProgressBarProps {
  /** Current progress value (0-max) */
  current: number;
  /** Maximum progress value */
  max: number;
  /** Size of the progress bar */
  size?: 'small' | 'medium' | 'large';
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Show progress numbers above the bar */
  showLabel?: boolean;
  /** Custom label text (overrides default "X / Y") */
  label?: string;
  /** Show percentage instead of fraction */
  showPercentage?: boolean;
}

/**
 * ProgressBar Component
 *
 * A visual progress indicator for tracking session completion.
 * Features smooth animations, color variants, and optional labels.
 * Designed for kids to easily understand their progress through a session.
 *
 * @example
 * ```tsx
 * <ProgressBar
 *   current={7}
 *   max={20}
 *   size="large"
 *   variant="default"
 *   showLabel
 * />
 *
 * <ProgressBar
 *   current={18}
 *   max={20}
 *   variant="success"
 *   showPercentage
 * />
 * ```
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  size = 'medium',
  variant = 'default',
  showLabel = true,
  label,
  showPercentage = false,
}) => {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0;

  const sizeStyles = {
    small: 'h-2',
    medium: 'h-4',
    large: 'h-6',
  };

  const labelSizeStyles = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const variantStyles = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  const getDisplayLabel = () => {
    if (label) return label;
    if (showPercentage) return `${percentage}%`;
    return `${current} / ${max}`;
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className={`font-bold text-gray-700 ${labelSizeStyles[size]}`}>
            {getDisplayLabel()}
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`${sizeStyles[size]} ${variantStyles[variant]} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={getDisplayLabel()}
        />
      </div>
    </div>
  );
};
