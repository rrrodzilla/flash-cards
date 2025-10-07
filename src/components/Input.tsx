import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  inputSize?: 'small' | 'medium' | 'large';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      inputSize = 'medium',
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const baseStyles = 'w-full rounded-xl border-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100';

    const sizeStyles = {
      small: 'min-h-[44px] px-4 py-2 text-base',
      medium: 'min-h-[52px] px-5 py-3 text-lg',
      large: 'min-h-[60px] px-6 py-4 text-xl',
    };

    const stateStyles = hasError
      ? 'border-red-500 focus:border-red-600 focus:ring-red-300 bg-red-50'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300 bg-white';

    const containerWidth = fullWidth ? 'w-full' : '';

    return (
      <div className={`${containerWidth}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-lg font-bold text-gray-800"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseStyles} ${sizeStyles[inputSize]} ${stateStyles} ${className}`}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm font-semibold text-red-600 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-2 text-sm text-gray-600 font-medium"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
