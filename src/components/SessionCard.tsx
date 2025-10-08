import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './Card';
import type { Session } from '../types';

/**
 * SessionCard component props interface
 */
export interface SessionCardProps {
  /** Session data to display */
  session: Session;
}

/**
 * SessionCard Component
 *
 * Mobile-friendly card layout for displaying individual session history.
 * Features expand/collapse interaction for session details with smooth animations.
 * Uses color-coded performance indicators and kid-friendly emojis.
 *
 * Performance thresholds:
 * - ≥90%: Green (🌟 Mastered!)
 * - ≥75%: Blue (✅ Great job!)
 * - ≥60%: Yellow (📚 Practicing)
 * - <60%: Orange (🎯 Keep trying!)
 *
 * @example
 * ```tsx
 * <SessionCard session={sessionData} />
 * ```
 */
export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate percentage score
  const percentage =
    session.totalCards > 0
      ? Math.round((session.score / session.totalCards) * 100)
      : 0;

  // Determine color scheme based on performance
  const getPerformanceStyles = (perc: number) => {
    if (perc >= 90) {
      return {
        textColor: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        emoji: '🌟',
      };
    } else if (perc >= 75) {
      return {
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        emoji: '✅',
      };
    } else if (perc >= 60) {
      return {
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        emoji: '📚',
      };
    } else {
      return {
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300',
        emoji: '🎯',
      };
    }
  };

  const performanceStyles = getPerformanceStyles(percentage);

  // Format relative date
  const formatRelativeDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format time duration
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      role="article"
      aria-label={`Session from ${formatRelativeDate(session.timestamp)}`}
    >
      <Card
        variant="elevated"
        padding="medium"
        className={`border-2 ${performanceStyles.borderColor}`}
      >
        {/* Header: Date and Expand Button */}
        <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">
          {formatRelativeDate(session.timestamp)}
        </h3>
        <button
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Hide session details' : 'Show session details'}
        >
          {isExpanded ? (
            <ChevronUp size={24} className="text-gray-600" />
          ) : (
            <ChevronDown size={24} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Score Display - Primary Metric */}
      <div className="mb-3">
        <div className={`text-3xl font-bold ${performanceStyles.textColor} flex items-center gap-2`}>
          <span>{performanceStyles.emoji}</span>
          <span>
            {session.score}/{session.totalCards}
          </span>
          <span className="text-gray-500 text-2xl">({percentage}%)</span>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {session.timedOut ? (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
            Still Practicing
          </span>
        ) : (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            Complete
          </span>
        )}
      </div>

      {/* Expanded Details Section */}
      <div
        className={`overflow-hidden transition-all duration-300 motion-reduce:transition-none ${
          isExpanded ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isExpanded}
      >
        <div className="border-t-2 border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 font-semibold">Cards:</span>
            <span className="text-sm text-gray-900 font-bold">{session.totalCards}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 font-semibold">Time:</span>
            <span className="text-sm text-gray-900 font-bold">
              {session.finishTime
                ? formatTime(session.finishTime)
                : session.timedOut
                ? 'Timeout'
                : '-'}
            </span>
          </div>
        </div>
      </div>
      </Card>
    </div>
  );
};
