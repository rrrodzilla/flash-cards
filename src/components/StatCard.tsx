import { ReactNode } from 'react';
import ProgressRing from './ProgressRing';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  progress?: number;
  subtext?: string;
  className?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  color = 'text-blue-600',
  bgColor = 'bg-white',
  borderColor = 'border-blue-200',
  progress,
  subtext,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`${bgColor} rounded-2xl shadow-lg p-6 border-2 ${borderColor} ${className}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={color}>{icon}</div>
        <p className="text-sm font-semibold text-gray-600">{label}</p>
      </div>

      {progress !== undefined ? (
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className={`text-4xl font-black ${color} tabular-nums`}>{value}</p>
            {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
          </div>
          <ProgressRing
            progress={progress}
            size={60}
            strokeWidth={6}
            color={color.includes('blue') ? '#3B82F6' : '#10B981'}
          >
            <span className="text-xs font-bold text-gray-700">
              {Math.round(progress)}%
            </span>
          </ProgressRing>
        </div>
      ) : (
        <>
          <p className={`text-4xl font-black ${color} tabular-nums`}>{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </>
      )}
    </div>
  );
}
