interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function AchievementBadge({
  title,
  description,
  icon,
  earned,
  size = 'medium',
  className = '',
}: AchievementBadgeProps) {
  const sizeClasses = {
    small: 'w-16 h-16 text-3xl',
    medium: 'w-24 h-24 text-5xl',
    large: 'w-32 h-32 text-6xl',
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          rounded-2xl
          flex items-center justify-center
          transition-all duration-300
          ${
            earned
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl shadow-yellow-500/30 animate-pulse'
              : 'bg-gray-200 grayscale opacity-40'
          }
        `}
        role="img"
        aria-label={earned ? `Earned: ${title}` : `Locked: ${title}`}
      >
        <span className={earned ? 'drop-shadow-lg' : ''}>{icon}</span>
      </div>
      <div className="text-center">
        <p
          className={`font-bold ${textSizeClasses[size]} ${
            earned ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {title}
        </p>
        <p
          className={`text-xs ${
            earned ? 'text-gray-600' : 'text-gray-400'
          } max-w-[150px]`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
