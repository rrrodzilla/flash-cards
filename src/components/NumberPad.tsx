import React, { useEffect, useCallback } from 'react';

export interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  maxLength?: number;
  disabled?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  value,
  onChange,
  onSubmit,
  maxLength = 3,
  disabled = false,
}) => {
  const handleNumberClick = useCallback((num: number) => {
    if (disabled) return;
    if (value.length >= maxLength) return;

    const newValue = value === '0' ? num.toString() : value + num.toString();
    onChange(newValue);
  }, [disabled, value, maxLength, onChange]);

  const handleBackspace = useCallback(() => {
    if (disabled) return;
    if (value.length === 0) return;

    const newValue = value.slice(0, -1);
    onChange(newValue || '0');
  }, [disabled, value, onChange]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    onChange('0');
  }, [disabled, onChange]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    if (!onSubmit) return;
    if (value === '0' || value === '') return;

    onSubmit();
  }, [disabled, onSubmit, value]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled) return;

      if (event.key >= '0' && event.key <= '9') {
        event.preventDefault();
        handleNumberClick(parseInt(event.key, 10));
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleBackspace();
      } else if (event.key === 'Enter' && onSubmit) {
        event.preventDefault();
        handleSubmit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        handleClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onSubmit, handleNumberClick, handleBackspace, handleSubmit, handleClear]);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="w-full max-w-sm mx-auto" role="group" aria-label="Number pad">
      <div
        className="mb-6 min-h-[80px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-inner p-4"
        role="textbox"
        aria-label="Current answer"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="text-6xl font-bold text-blue-900 tabular-nums">
          {value || '0'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            disabled={disabled}
            className="min-h-[64px] bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-3xl font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2"
            aria-label={`Number ${num}`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleClear}
          disabled={disabled}
          className="min-h-[64px] bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-offset-2"
          aria-label="Clear"
        >
          Clear
        </button>

        <button
          onClick={() => handleNumberClick(0)}
          disabled={disabled}
          className="min-h-[64px] bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-3xl font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2"
          aria-label="Number 0"
        >
          0
        </button>

        <button
          onClick={handleBackspace}
          disabled={disabled}
          className="min-h-[64px] bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-offset-2 flex items-center justify-center"
          aria-label="Backspace"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
            />
          </svg>
        </button>
      </div>

      {onSubmit && (
        <button
          onClick={handleSubmit}
          disabled={disabled || value === '0' || value === ''}
          className="w-full mt-3 min-h-[64px] bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-2xl font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2"
          aria-label="Submit answer"
        >
          Submit Answer
        </button>
      )}
    </div>
  );
};
