import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'flat' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
}

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
    ? 'cursor-pointer active:scale-98 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2'
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
