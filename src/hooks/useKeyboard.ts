/**
 * Custom hook for handling keyboard input for number entry.
 *
 * Features:
 * - Number input (0-9)
 * - Backspace support
 * - Enter key for submission
 * - Escape key for clearing
 * - Configurable max length
 * - Auto-focus management
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseKeyboardOptions {
  onSubmit?: (value: string) => void;
  onEscape?: () => void;
  maxLength?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}

interface UseKeyboardReturn {
  value: string;
  setValue: (value: string) => void;
  clear: () => void;
  appendDigit: (digit: string) => void;
  backspace: () => void;
  submit: () => void;
  isValid: boolean;
}

/**
 * Custom hook for keyboard-based number input.
 *
 * @param options - Configuration options
 * @returns Input state and control functions
 */
export function useKeyboard({
  onSubmit,
  onEscape,
  maxLength = 3,
  autoFocus = true,
  disabled = false,
}: UseKeyboardOptions = {}): UseKeyboardReturn {
  const [value, setValue] = useState('');
  const isListeningRef = useRef(false);

  const clear = useCallback(() => {
    setValue('');
  }, []);

  const appendDigit = useCallback(
    (digit: string) => {
      if (disabled) {
        return;
      }

      const digitNum = parseInt(digit, 10);

      if (isNaN(digitNum) || digitNum < 0 || digitNum > 9) {
        return;
      }

      setValue((prev) => {
        if (prev.length >= maxLength) {
          return prev;
        }
        return prev + digit;
      });
    },
    [maxLength, disabled]
  );

  const backspace = useCallback(() => {
    if (disabled) {
      return;
    }

    setValue((prev) => prev.slice(0, -1));
  }, [disabled]);

  const submit = useCallback(() => {
    if (disabled || value.length === 0) {
      return;
    }

    onSubmit?.(value);
    clear();
  }, [value, onSubmit, clear, disabled]);

  useEffect(() => {
    if (isListeningRef.current || disabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key;

      if (key >= '0' && key <= '9') {
        event.preventDefault();
        appendDigit(key);
      } else if (key === 'Backspace') {
        event.preventDefault();
        backspace();
      } else if (key === 'Enter') {
        event.preventDefault();
        submit();
      } else if (key === 'Escape') {
        event.preventDefault();
        clear();
        onEscape?.();
      }
    };

    if (autoFocus) {
      window.addEventListener('keydown', handleKeyDown);
      isListeningRef.current = true;
    }

    return () => {
      if (isListeningRef.current) {
        window.removeEventListener('keydown', handleKeyDown);
        isListeningRef.current = false;
      }
    };
  }, [
    appendDigit,
    backspace,
    submit,
    clear,
    onEscape,
    autoFocus,
    disabled,
  ]);

  const isValid = value.length > 0;

  return {
    value,
    setValue,
    clear,
    appendDigit,
    backspace,
    submit,
    isValid,
  };
}

/**
 * Alternative hook for handling keyboard shortcuts without input state.
 * Useful for global keyboard shortcuts.
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const handler = shortcuts[key];

      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
}
