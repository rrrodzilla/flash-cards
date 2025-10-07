import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  message,
  fullScreen = false,
}) => {
  const sizeStyles = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  const colorStyles = {
    primary: 'text-blue-500',
    secondary: 'text-purple-500',
    white: 'text-white',
  };

  const messageSizeStyles = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <svg
          className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          role="status"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-ping opacity-75 ${
              size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-4 h-4' : 'w-6 h-6'
            }`}
          />
        </div>
      </div>

      {message && (
        <p
          className={`font-bold ${messageSizeStyles[size]} ${
            color === 'white' ? 'text-white' : 'text-gray-700'
          } animate-pulse`}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 backdrop-blur-sm"
        role="alert"
        aria-busy="true"
        aria-live="polite"
      >
        {spinner}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center p-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      {spinner}
    </div>
  );
};
