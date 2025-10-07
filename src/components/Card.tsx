import React from 'react';

/**
 * Card component props interface
 */
export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Visual style variant of the card */
  variant?: 'flat' | 'elevated' | 'outlined';
  /** Internal padding amount */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Additional CSS classes */
  className?: string;
  /** Click handler, makes card interactive when provided */
  onClick?: () => void;
}

/**
 * Card Component
 *
 * A versatile container component with multiple visual styles.
 * When onClick is provided, the card becomes interactive with haptic feedback.
 * Designed with mobile-first accessibility for children ages 8-12.
 *
 * @example
 * ```tsx
 * <Card variant="elevated" padding="medium">
 *   <h2>Flash Card</h2>
 *   <p>2 × 8 = ?</p>
 * </Card>
 *
 * <Card variant="outlined" onClick={() => selectUser(user)}>
 *   <p>{user.name}</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  className = '',
  onClick,
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200';

  const variantStyles = {
    flat: 'bg-white',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
    outlined: 'bg-white border-2 border-gray-300',
  };

  const paddingStyles = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const interactiveStyles = onClick
    ? 'cursor-pointer active:scale-98 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 touch-manipulation'
    : '';

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
      onClick={onClick}
      {...(onClick
        ? {
            type: 'button',
            role: 'button',
            tabIndex: 0,
          }
        : {})}
    >
      {children}
    </Component>
  );
};
