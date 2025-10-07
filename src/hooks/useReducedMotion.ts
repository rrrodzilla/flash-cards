import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 *
 * Monitors the 'prefers-reduced-motion' media query to respect user
 * accessibility preferences. When enabled, animations should be
 * minimized or removed entirely.
 *
 * @returns boolean indicating if reduced motion is preferred
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * // Skip or simplify animations
 * if (prefersReducedMotion) {
 *   showContent();
 * } else {
 *   animateContent();
 * }
 * ```
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};
