/**
 * Display formatting utilities.
 *
 * Provides functions for formatting:
 * - Scores
 * - Percentages
 * - Durations
 * - Numbers
 * - File sizes
 */

/**
 * Formats a score as "X/Y" or "X/Y (Z%)".
 *
 * @param score - Number of correct answers
 * @param total - Total number of questions
 * @param includePercentage - Whether to include percentage
 * @returns Formatted score string
 */
export function formatScore(
  score: number,
  total: number,
  includePercentage = true
): string {
  if (!includePercentage) {
    return `${score}/${total}`;
  }

  const percentage = total > 0 ? (score / total) * 100 : 0;
  return `${score}/${total} (${formatPercentage(percentage)})`;
}

/**
 * Formats a percentage value.
 *
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string with % symbol
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a duration in seconds to MM:SS or HH:MM:SS.
 *
 * @param seconds - Duration in seconds
 * @param alwaysShowHours - Whether to always show hours even if 0
 * @returns Formatted duration string
 */
export function formatSessionDuration(
  seconds: number,
  alwaysShowHours = false
): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0 || alwaysShowHours) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats a duration in seconds to human-readable format.
 *
 * @param seconds - Duration in seconds
 * @param short - Whether to use short format (1h 2m vs 1 hour 2 minutes)
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number, short = false): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (short) {
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  } else {
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (secs > 0 || parts.length === 0)
      parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
  }

  return parts.join(' ');
}

/**
 * Formats a number with thousand separators.
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats a file size in bytes to human-readable format.
 *
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}

/**
 * Formats a streak count.
 *
 * @param count - Streak count
 * @returns Formatted streak string
 */
export function formatStreak(count: number): string {
  if (count === 0) {
    return 'No streak';
  }

  const emoji = count >= 10 ? '🔥' : count >= 5 ? '⭐' : '✨';
  return `${count} session${count !== 1 ? 's' : ''} ${emoji}`;
}

/**
 * Formats a grade based on percentage.
 *
 * @param percentage - Score percentage (0-100)
 * @returns Letter grade
 */
export function formatGrade(percentage: number): string {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
}

/**
 * Formats an accuracy rating based on percentage.
 *
 * @param percentage - Accuracy percentage (0-100)
 * @returns Rating string
 */
export function formatAccuracyRating(percentage: number): string {
  if (percentage === 100) return 'Perfect';
  if (percentage >= 95) return 'Excellent';
  if (percentage >= 85) return 'Great';
  if (percentage >= 75) return 'Good';
  if (percentage >= 60) return 'Fair';
  if (percentage >= 50) return 'Needs Practice';
  return 'Keep Trying';
}

/**
 * Formats a number list to a human-readable string.
 *
 * @param numbers - Array of numbers
 * @param conjunction - Conjunction word ('and' or 'or')
 * @returns Formatted string
 */
export function formatNumberList(
  numbers: number[],
  conjunction: 'and' | 'or' = 'and'
): string {
  if (numbers.length === 0) return '';
  if (numbers.length === 1) return numbers[0]?.toString() ?? '';
  if (numbers.length === 2)
    return `${numbers[0]} ${conjunction} ${numbers[1]}`;

  const lastNumber = numbers[numbers.length - 1];
  const otherNumbers = numbers.slice(0, -1);
  return `${otherNumbers.join(', ')}, ${conjunction} ${lastNumber}`;
}

/**
 * Formats a timestamp as elapsed time (e.g., "2 minutes ago").
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted elapsed time string
 */
export function formatElapsedTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/**
 * Formats an ordinal number (1st, 2nd, 3rd, etc.).
 *
 * @param n - Number to format
 * @returns Formatted ordinal string
 */
export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  const suffix = s[(v - 20) % 10] ?? s[v] ?? s[0] ?? 'th';
  return n + suffix;
}

/**
 * Truncates a string to a maximum length with ellipsis.
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Ellipsis string
 * @returns Truncated string
 */
export function truncate(
  str: string,
  maxLength: number,
  ellipsis = '...'
): string {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a multiplication problem.
 *
 * @param operand1 - First operand
 * @param operand2 - Second operand
 * @param showAnswer - Whether to show the answer
 * @returns Formatted problem string
 */
export function formatProblem(
  operand1: number,
  operand2: number,
  showAnswer = false
): string {
  const problem = `${operand1} × ${operand2}`;
  if (showAnswer) {
    return `${problem} = ${operand1 * operand2}`;
  }
  return `${problem} = ?`;
}
