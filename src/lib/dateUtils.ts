/**
 * Date and time utility functions.
 *
 * Provides formatting, comparison, and grouping utilities for dates and timestamps.
 */

import type { Session } from '../types';

/**
 * Formats a timestamp as a date string.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param format - Format type ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(
  timestamp: number,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const date = new Date(timestamp);

  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
      });

    case 'medium':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    default:
      return date.toLocaleDateString();
  }
}

/**
 * Formats a timestamp as a time string.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param includeSeconds - Whether to include seconds
 * @returns Formatted time string
 */
export function formatTime(timestamp: number, includeSeconds = false): string {
  const date = new Date(timestamp);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
  });
}

/**
 * Formats a timestamp as a complete date and time string.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp, 'medium')} at ${formatTime(timestamp)}`;
}

/**
 * Formats a time duration in seconds to a human-readable string.
 *
 * @param seconds - Duration in seconds
 * @param format - Format type ('short', 'medium', 'long')
 * @returns Formatted duration string
 */
export function formatTimeDuration(
  seconds: number,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (format === 'short') {
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  if (format === 'long') {
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (secs > 0 || parts.length === 0)
      parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
    return parts.join(', ');
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Returns a relative time string (e.g., "2 hours ago", "just now").
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/**
 * Checks if two timestamps are on the same day.
 *
 * @param timestamp1 - First timestamp
 * @param timestamp2 - Second timestamp
 * @returns True if same day, false otherwise
 */
export function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Checks if a timestamp is today.
 *
 * @param timestamp - Timestamp to check
 * @returns True if today, false otherwise
 */
export function isToday(timestamp: number): boolean {
  return isSameDay(timestamp, Date.now());
}

/**
 * Checks if a timestamp is yesterday.
 *
 * @param timestamp - Timestamp to check
 * @returns True if yesterday, false otherwise
 */
export function isYesterday(timestamp: number): boolean {
  const yesterday = Date.now() - 24 * 60 * 60 * 1000;
  return isSameDay(timestamp, yesterday);
}

/**
 * Checks if a timestamp is within the last N days.
 *
 * @param timestamp - Timestamp to check
 * @param days - Number of days
 * @returns True if within N days, false otherwise
 */
export function isWithinDays(timestamp: number, days: number): boolean {
  const now = Date.now();
  const diff = now - timestamp;
  return diff <= days * 24 * 60 * 60 * 1000;
}

/**
 * Groups sessions by date.
 *
 * @param sessions - Array of sessions
 * @returns Map of date string to sessions
 */
export function groupSessionsByDate(
  sessions: Session[]
): Map<string, Session[]> {
  const grouped = new Map<string, Session[]>();

  for (const session of sessions) {
    const dateKey = formatDate(session.timestamp, 'short');
    const existing = grouped.get(dateKey) ?? [];
    existing.push(session);
    grouped.set(dateKey, existing);
  }

  return grouped;
}

/**
 * Groups sessions by week.
 *
 * @param sessions - Array of sessions
 * @returns Map of week string to sessions
 */
export function groupSessionsByWeek(
  sessions: Session[]
): Map<string, Session[]> {
  const grouped = new Map<string, Session[]>();

  for (const session of sessions) {
    const date = new Date(session.timestamp);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekKey = formatDate(weekStart.getTime(), 'short');
    const existing = grouped.get(weekKey) ?? [];
    existing.push(session);
    grouped.set(weekKey, existing);
  }

  return grouped;
}

/**
 * Groups sessions by month.
 *
 * @param sessions - Array of sessions
 * @returns Map of month string to sessions
 */
export function groupSessionsByMonth(
  sessions: Session[]
): Map<string, Session[]> {
  const grouped = new Map<string, Session[]>();

  for (const session of sessions) {
    const date = new Date(session.timestamp);
    const monthKey = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    const existing = grouped.get(monthKey) ?? [];
    existing.push(session);
    grouped.set(monthKey, existing);
  }

  return grouped;
}

/**
 * Gets the start of day timestamp for a given timestamp.
 *
 * @param timestamp - Input timestamp
 * @returns Start of day timestamp
 */
export function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Gets the end of day timestamp for a given timestamp.
 *
 * @param timestamp - Input timestamp
 * @returns End of day timestamp
 */
export function getEndOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/**
 * Gets the start of week timestamp for a given timestamp.
 *
 * @param timestamp - Input timestamp
 * @returns Start of week timestamp (Sunday)
 */
export function getStartOfWeek(timestamp: number): number {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = date.getDate() - day;
  const weekStart = new Date(date);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.getTime();
}

/**
 * Gets the start of month timestamp for a given timestamp.
 *
 * @param timestamp - Input timestamp
 * @returns Start of month timestamp
 */
export function getStartOfMonth(timestamp: number): number {
  const date = new Date(timestamp);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
