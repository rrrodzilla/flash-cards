/**
 * Production-grade local storage abstraction layer for Flash Cards application.
 *
 * Features:
 * - Comprehensive error handling (quota exceeded, corrupted data, security errors)
 * - Data validation and sanitization with type guards
 * - Default fallbacks for missing/invalid data
 * - Type-safe operations throughout
 * - Import/export functionality
 * - Storage monitoring utilities
 */

import type { User, Settings, Session, Card } from '../types';
import { StorageKeys, DEFAULT_SETTINGS } from '../types';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly isQuotaExceeded: boolean = false
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

function safeStorageOperation<T>(
  operation: () => T,
  errorContext: string
): T {
  try {
    return operation();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error(`[Storage] Quota exceeded in ${errorContext}:`, error);
      throw new StorageError(
        `Storage quota exceeded. Please clear some data to continue.`,
        error,
        true
      );
    }

    if (error instanceof DOMException && error.name === 'SecurityError') {
      console.error(`[Storage] Security error in ${errorContext}:`, error);
      throw new StorageError(
        `Unable to access local storage. Please check browser settings.`,
        error
      );
    }

    console.error(`[Storage] Error in ${errorContext}:`, error);
    throw new StorageError(
      `Storage operation failed: ${errorContext}`,
      error
    );
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

function isCard(value: unknown): value is Card {
  if (!value || typeof value !== 'object') return false;
  const card = value as Record<string, unknown>;
  return (
    typeof card.problem === 'string' &&
    typeof card.operand1 === 'number' &&
    typeof card.operand2 === 'number' &&
    typeof card.userAnswer === 'number' &&
    typeof card.correctAnswer === 'number' &&
    typeof card.isCorrect === 'boolean'
  );
}

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    user.id.length > 0 &&
    typeof user.name === 'string' &&
    user.name.length > 0 &&
    typeof user.createdAt === 'number' &&
    user.createdAt > 0
  );
}

function isUserArray(value: unknown): value is User[] {
  return Array.isArray(value) && value.every(isUser);
}

function isSettings(value: unknown): value is Settings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Record<string, unknown>;
  return (
    Array.isArray(settings.includedNumbers) &&
    settings.includedNumbers.every(
      (n) => typeof n === 'number' && n >= 1 && n <= 12 && Number.isInteger(n)
    ) &&
    settings.includedNumbers.length > 0 &&
    typeof settings.cardsPerSession === 'number' &&
    settings.cardsPerSession > 0 &&
    settings.cardsPerSession <= 100 &&
    Number.isInteger(settings.cardsPerSession) &&
    typeof settings.timeLimit === 'number' &&
    settings.timeLimit > 0 &&
    settings.timeLimit <= 3600
  );
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const session = value as Record<string, unknown>;
  return (
    typeof session.userId === 'string' &&
    session.userId.length > 0 &&
    typeof session.sessionId === 'string' &&
    session.sessionId.length > 0 &&
    typeof session.timestamp === 'number' &&
    session.timestamp > 0 &&
    Array.isArray(session.cards) &&
    session.cards.every(isCard) &&
    typeof session.score === 'number' &&
    session.score >= 0 &&
    typeof session.totalCards === 'number' &&
    session.totalCards >= 0 &&
    (session.finishTime === undefined ||
      (typeof session.finishTime === 'number' && session.finishTime > 0)) &&
    typeof session.timedOut === 'boolean'
  );
}

function isSessionArray(value: unknown): value is Session[] {
  return Array.isArray(value) && value.every(isSession);
}

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

function safeParse<T>(
  key: string,
  validator: (value: unknown) => value is T,
  defaultValue: T
): T {
  try {
    const item = localStorage.getItem(key);

    if (!item) {
      return defaultValue;
    }

    const parsed: unknown = JSON.parse(item);

    if (!validator(parsed)) {
      console.warn(
        `[Storage] Invalid data for key "${key}", using default value`
      );
      return defaultValue;
    }

    return parsed;
  } catch (error) {
    console.error(`[Storage] Failed to parse data for key "${key}":`, error);
    return defaultValue;
  }
}

function safeStore(key: string, value: unknown): void {
  safeStorageOperation(() => {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  }, `storing ${key}`);
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// ============================================================================
// USER STORAGE
// ============================================================================

/**
 * Retrieves all users from localStorage
 * Returns empty array if no users exist or data is corrupted
 */
export function getUsers(): User[] {
  return safeStorageOperation(() => {
    return safeParse<User[]>(StorageKeys.USERS, isUserArray, []);
  }, 'getUsers');
}

/**
 * Retrieves a specific user by ID
 * Returns null if user not found
 */
export function getUser(id: string): User | null {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    console.warn('[Storage] getUser: Invalid user ID provided');
    return null;
  }

  const users = getUsers();
  const foundUser = users.find((user) => user.id === id);
  return foundUser ?? null;
}

/**
 * Creates a new user
 * Throws StorageError if:
 * - Name is invalid
 * - User with same name already exists
 * - Storage quota exceeded
 */
export function createUser(name: string): User {
  if (!name || typeof name !== 'string') {
    throw new StorageError('User name must be a non-empty string');
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    throw new StorageError('User name cannot be empty');
  }

  if (trimmedName.length > 100) {
    throw new StorageError('User name must be 100 characters or less');
  }

  return safeStorageOperation(() => {
    const users = getUsers();

    const duplicate = users.find(
      (user) => user.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      throw new StorageError(
        `A user with the name "${trimmedName}" already exists`
      );
    }

    const newUser: User = {
      id: generateId(),
      name: trimmedName,
      createdAt: Date.now(),
    };

    users.push(newUser);
    safeStore(StorageKeys.USERS, users);

    return newUser;
  }, 'createUser');
}

/**
 * Updates an existing user
 * Only name can be updated (id and createdAt are immutable)
 * Returns updated user or null if user not found
 */
export function updateUser(
  id: string,
  updates: Partial<Pick<User, 'name'>>
): User | null {
  if (!id || typeof id !== 'string') {
    console.warn('[Storage] updateUser: Invalid user ID provided');
    return null;
  }

  if (!updates || typeof updates !== 'object') {
    console.warn('[Storage] updateUser: Invalid updates object');
    return null;
  }

  return safeStorageOperation(() => {
    const users = getUsers();
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return null;
    }

    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string') {
        throw new StorageError('User name must be a string');
      }

      const trimmedName = updates.name.trim();

      if (trimmedName.length === 0) {
        throw new StorageError('User name cannot be empty');
      }

      if (trimmedName.length > 100) {
        throw new StorageError('User name must be 100 characters or less');
      }

      const duplicate = users.find(
        (user) =>
          user.id !== id &&
          user.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (duplicate) {
        throw new StorageError(
          `A user with the name "${trimmedName}" already exists`
        );
      }

      const currentUser = users[userIndex];
      if (currentUser) {
        users[userIndex] = {
          ...currentUser,
          name: trimmedName,
        };
      }
    }

    safeStore(StorageKeys.USERS, users);
    const updatedUser = users[userIndex];
    return updatedUser ?? null;
  }, 'updateUser');
}

/**
 * Deletes a user and all associated sessions
 * Returns true if user was deleted, false if user not found
 */
export function deleteUser(id: string): boolean {
  if (!id || typeof id !== 'string') {
    console.warn('[Storage] deleteUser: Invalid user ID provided');
    return false;
  }

  return safeStorageOperation(() => {
    const users = getUsers();
    const filteredUsers = users.filter((user) => user.id !== id);

    if (filteredUsers.length === users.length) {
      return false;
    }

    safeStore(StorageKeys.USERS, filteredUsers);

    const sessions = getSessions(id);
    if (sessions.length > 0) {
      const allSessions = safeParse<Session[]>(
        StorageKeys.SESSIONS,
        isSessionArray,
        []
      );
      const filteredSessions = allSessions.filter(
        (session) => session.userId !== id
      );
      safeStore(StorageKeys.SESSIONS, filteredSessions);
    }

    return true;
  }, 'deleteUser');
}

// ============================================================================
// SETTINGS STORAGE
// ============================================================================

/**
 * Retrieves application settings
 * Returns default settings if none exist or data is corrupted
 */
export function getSettings(): Settings {
  return safeStorageOperation(() => {
    return safeParse<Settings>(
      StorageKeys.SETTINGS,
      isSettings,
      { ...DEFAULT_SETTINGS }
    );
  }, 'getSettings');
}

/**
 * Updates application settings
 * Validates all settings before saving
 * Returns updated settings
 */
export function updateSettings(settings: Partial<Settings>): Settings {
  if (!settings || typeof settings !== 'object') {
    throw new StorageError('Settings must be a valid object');
  }

  return safeStorageOperation(() => {
    const currentSettings = getSettings();
    const updatedSettings: Settings = {
      ...currentSettings,
      ...settings,
    };

    if (!isSettings(updatedSettings)) {
      throw new StorageError('Invalid settings provided');
    }

    if (updatedSettings.includedNumbers.length === 0) {
      throw new StorageError('At least one number must be included');
    }

    if (updatedSettings.cardsPerSession < 1 || updatedSettings.cardsPerSession > 100) {
      throw new StorageError('Cards per session must be between 1 and 100');
    }

    if (updatedSettings.timeLimit < 1 || updatedSettings.timeLimit > 3600) {
      throw new StorageError('Time limit must be between 1 and 3600 seconds');
    }

    safeStore(StorageKeys.SETTINGS, updatedSettings);
    return updatedSettings;
  }, 'updateSettings');
}

/**
 * Resets settings to default values
 */
export function resetSettings(): Settings {
  return safeStorageOperation(() => {
    const defaults = { ...DEFAULT_SETTINGS };
    safeStore(StorageKeys.SETTINGS, defaults);
    return defaults;
  }, 'resetSettings');
}

/**
 * Validates settings object
 */
export function validateSettings(settings: unknown): boolean {
  return isSettings(settings);
}

// ============================================================================
// SESSION STORAGE
// ============================================================================

/**
 * Retrieves all sessions for a user, sorted by timestamp (newest first)
 * Returns empty array if no sessions exist or data is corrupted
 */
export function getSessions(userId: string): Session[] {
  if (!userId || typeof userId !== 'string') {
    console.warn('[Storage] getSessions: Invalid user ID provided');
    return [];
  }

  return safeStorageOperation(() => {
    const allSessions = safeParse<Session[]>(
      StorageKeys.SESSIONS,
      isSessionArray,
      []
    );

    return allSessions
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, 'getSessions');
}

/**
 * Retrieves the last N sessions for a user
 * Only returns completed sessions (excludes in-progress)
 */
export function getLastNSessions(userId: string, n: number): Session[] {
  if (!userId || typeof userId !== 'string') {
    console.warn('[Storage] getLastNSessions: Invalid user ID provided');
    return [];
  }

  if (typeof n !== 'number' || n < 1 || !Number.isInteger(n)) {
    console.warn('[Storage] getLastNSessions: Invalid count provided');
    return [];
  }

  const sessions = getSessions(userId);
  return sessions.slice(0, n);
}

/**
 * Creates a new session
 * Session starts in "in-progress" state via CurrentSession
 */
export function createSession(userId: string, settings: Settings): Session {
  if (!userId || typeof userId !== 'string') {
    throw new StorageError('User ID must be a valid string');
  }

  if (!isSettings(settings)) {
    throw new StorageError('Invalid settings provided');
  }

  const user = getUser(userId);
  if (!user) {
    throw new StorageError(`User with ID "${userId}" not found`);
  }

  return safeStorageOperation(() => {
    const newSession: Session = {
      userId,
      sessionId: generateId(),
      timestamp: Date.now(),
      cards: [],
      score: 0,
      totalCards: settings.cardsPerSession,
      timedOut: false,
    };

    const allSessions = safeParse<Session[]>(
      StorageKeys.SESSIONS,
      isSessionArray,
      []
    );

    allSessions.push(newSession);
    safeStore(StorageKeys.SESSIONS, allSessions);

    return newSession;
  }, 'createSession');
}

/**
 * Updates an existing session
 * Immutable fields (userId, sessionId, timestamp) cannot be changed
 */
export function updateSession(
  sessionId: string,
  updates: Partial<Omit<Session, 'userId' | 'sessionId' | 'timestamp'>>
): Session | null {
  if (!sessionId || typeof sessionId !== 'string') {
    console.warn('[Storage] updateSession: Invalid session ID provided');
    return null;
  }

  if (!updates || typeof updates !== 'object') {
    console.warn('[Storage] updateSession: Invalid updates object');
    return null;
  }

  return safeStorageOperation(() => {
    const allSessions = safeParse<Session[]>(
      StorageKeys.SESSIONS,
      isSessionArray,
      []
    );

    const sessionIndex = allSessions.findIndex(
      (session) => session.sessionId === sessionId
    );

    if (sessionIndex === -1) {
      return null;
    }

    const currentSession = allSessions[sessionIndex];
    if (!currentSession) {
      return null;
    }

    const updatedSession: Session = {
      ...currentSession,
      ...updates,
    };

    if (!isSession(updatedSession)) {
      throw new StorageError('Invalid session data provided');
    }

    allSessions[sessionIndex] = updatedSession;
    safeStore(StorageKeys.SESSIONS, allSessions);

    return updatedSession;
  }, 'updateSession');
}

/**
 * Deletes a session
 * Returns true if session was deleted, false if session not found
 */
export function deleteSession(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') {
    console.warn('[Storage] deleteSession: Invalid session ID provided');
    return false;
  }

  return safeStorageOperation(() => {
    const allSessions = safeParse<Session[]>(
      StorageKeys.SESSIONS,
      isSessionArray,
      []
    );

    const filteredSessions = allSessions.filter(
      (session) => session.sessionId !== sessionId
    );

    if (filteredSessions.length === allSessions.length) {
      return false;
    }

    safeStore(StorageKeys.SESSIONS, filteredSessions);
    return true;
  }, 'deleteSession');
}

/**
 * Gets the current in-progress session for a user
 * Returns null if no session is in progress
 */
export function getCurrentSession(userId: string): Session | null {
  if (!userId || typeof userId !== 'string') {
    console.warn('[Storage] getCurrentSession: Invalid user ID provided');
    return null;
  }

  return safeStorageOperation(() => {
    const sessionId = localStorage.getItem(StorageKeys.CURRENT_SESSION);

    if (!sessionId) {
      return null;
    }

    const allSessions = safeParse<Session[]>(
      StorageKeys.SESSIONS,
      isSessionArray,
      []
    );

    const session = allSessions.find(
      (s) => s.sessionId === sessionId && s.userId === userId
    );

    return session ?? null;
  }, 'getCurrentSession');
}

/**
 * Sets the session start time for timer restoration
 */
export function setSessionStartTime(startTime: number): void {
  if (typeof startTime !== 'number' || startTime <= 0) {
    console.warn('[Storage] setSessionStartTime: Invalid start time provided');
    return;
  }

  safeStorageOperation(() => {
    localStorage.setItem(StorageKeys.SESSION_START_TIME, startTime.toString());
  }, 'setSessionStartTime');
}

/**
 * Gets the session start time for timer restoration
 * Returns null if no start time is stored
 */
export function getSessionStartTime(): number | null {
  return safeStorageOperation(() => {
    const startTime = localStorage.getItem(StorageKeys.SESSION_START_TIME);

    if (!startTime) {
      return null;
    }

    const parsed = parseInt(startTime, 10);

    if (isNaN(parsed) || parsed <= 0) {
      console.warn('[Storage] getSessionStartTime: Invalid start time in storage');
      return null;
    }

    return parsed;
  }, 'getSessionStartTime');
}

/**
 * Clears the session start time from storage
 */
export function clearSessionStartTime(): void {
  safeStorageOperation(() => {
    localStorage.removeItem(StorageKeys.SESSION_START_TIME);
  }, 'clearSessionStartTime');
}

// ============================================================================
// DATA MANAGEMENT
// ============================================================================

/**
 * Clears all application data from localStorage
 * This is a destructive operation that cannot be undone
 *
 * Clears:
 * - All StorageKeys (users, settings, sessions, current session, current user, session start time)
 * - Tutorial seen flags for all users (tutorial_seen_${userId})
 * - Schema version key
 */
export function clearAllData(): void {
  safeStorageOperation(() => {
    // Clear all StorageKeys
    Object.values(StorageKeys).forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clear schema version
    localStorage.removeItem(SCHEMA_VERSION_KEY);

    // Clear all tutorial-related keys
    // Get all users before clearing to find their tutorial keys
    const users = getUsers();
    users.forEach((user) => {
      localStorage.removeItem(`tutorial_seen_${user.id}`);
    });

    // Additional safety: clear any remaining flash-cards-* or tutorial_seen_* keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('flash-cards-') || key.startsWith('tutorial_seen_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }, 'clearAllData');
}

/**
 * Exports all application data as a JSON string
 * Can be used for backup or data transfer
 */
export function exportData(): string {
  return safeStorageOperation(() => {
    const data = {
      version: '1.0.0',
      exportDate: Date.now(),
      users: getUsers(),
      settings: getSettings(),
      sessions: safeParse<Session[]>(
        StorageKeys.SESSIONS,
        isSessionArray,
        []
      ),
    };

    return JSON.stringify(data, null, 2);
  }, 'exportData');
}

/**
 * Imports application data from a JSON string
 * Validates all data before importing
 * Returns true if import was successful
 * Throws StorageError if data is invalid
 */
export function importData(dataString: string): boolean {
  if (!dataString || typeof dataString !== 'string') {
    throw new StorageError('Import data must be a non-empty string');
  }

  return safeStorageOperation(() => {
    let data: unknown;

    try {
      data = JSON.parse(dataString);
    } catch (error) {
      throw new StorageError('Failed to parse import data', error);
    }

    if (!data || typeof data !== 'object') {
      throw new StorageError('Import data must be a valid object');
    }

    const importData = data as Record<string, unknown>;

    if (!isUserArray(importData.users)) {
      throw new StorageError('Import data contains invalid users');
    }

    if (!isSettings(importData.settings)) {
      throw new StorageError('Import data contains invalid settings');
    }

    if (!isSessionArray(importData.sessions)) {
      throw new StorageError('Import data contains invalid sessions');
    }

    safeStore(StorageKeys.USERS, importData.users);
    safeStore(StorageKeys.SETTINGS, importData.settings);
    safeStore(StorageKeys.SESSIONS, importData.sessions);

    return true;
  }, 'importData');
}

/**
 * Calculates the total size of stored data in bytes
 * Returns approximate size (actual size may vary by browser)
 */
export function getStorageSize(): number {
  return safeStorageOperation(() => {
    let totalSize = 0;

    Object.values(StorageKeys).forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length * 2;
        totalSize += key.length * 2;
      }
    });

    return totalSize;
  }, 'getStorageSize');
}

/**
 * Gets storage size in human-readable format
 */
export function getStorageSizeFormatted(): string {
  const bytes = getStorageSize();

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Checks if localStorage is available and working
 * Returns true if storage is accessible, false otherwise
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the estimated remaining storage space
 * Returns -1 if unable to determine
 */
export function getRemainingStorageSpace(): number {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return -1;
  }

  const TYPICAL_LIMIT = 5 * 1024 * 1024;
  const used = getStorageSize();
  return TYPICAL_LIMIT - used;
}

/**
 * Async version to get remaining storage space using StorageManager API
 */
export async function getRemainingStorageSpaceAsync(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota && estimate.usage) {
        return estimate.quota - estimate.usage;
      }
    } catch (error) {
      console.error('[Storage] Failed to estimate storage:', error);
    }
  }

  const TYPICAL_LIMIT = 5 * 1024 * 1024;
  const used = getStorageSize();
  return TYPICAL_LIMIT - used;
}

// ============================================================================
// MULTI-TAB SYNCHRONIZATION
// ============================================================================

/**
 * Storage change event handler type
 */
export type StorageChangeHandler = (key: string, newValue: unknown) => void;

const storageListeners = new Set<StorageChangeHandler>();

/**
 * Listens for storage changes from other tabs/windows
 * Returns cleanup function to remove listener
 */
export function onStorageChange(handler: StorageChangeHandler): () => void {
  storageListeners.add(handler);

  const listener = (event: StorageEvent): void => {
    if (!event.key || !Object.values(StorageKeys).includes(event.key as StorageKeys)) {
      return;
    }

    try {
      const newValue: unknown = event.newValue ? JSON.parse(event.newValue) : null;
      handler(event.key, newValue);
    } catch (error) {
      console.error('[Storage] Failed to parse storage change event:', error);
    }
  };

  window.addEventListener('storage', listener);

  return () => {
    storageListeners.delete(handler);
    window.removeEventListener('storage', listener);
  };
}

/**
 * Broadcasts a storage change to all registered listeners
 * Used for same-tab updates to maintain consistency
 */
function broadcastChange(key: string, value: unknown): void {
  storageListeners.forEach((handler) => {
    try {
      handler(key, value);
    } catch (error) {
      console.error('[Storage] Error in storage change handler:', error);
    }
  });
}

/**
 * Enhanced store function with multi-tab sync support
 */
function safeStoreWithSync(key: string, value: unknown): void {
  safeStore(key, value);
  broadcastChange(key, value);
}

// Re-export enhanced storage for future use
export { safeStoreWithSync };

// ============================================================================
// TRANSACTION-LIKE ATOMIC OPERATIONS
// ============================================================================

/**
 * Atomic transaction operation
 * Ensures all operations succeed or all fail together
 */
export function atomicTransaction<T>(
  operation: () => T,
  rollbackData?: Map<string, string | null>
): T {
  const backup = new Map<string, string | null>();

  try {
    // Backup current state if rollback data not provided
    if (!rollbackData) {
      Object.values(StorageKeys).forEach((key) => {
        backup.set(key, localStorage.getItem(key));
      });
    }

    // Execute operation
    const result = operation();

    return result;
  } catch (error) {
    // Rollback on error
    const dataToRestore = rollbackData || backup;

    dataToRestore.forEach((value, key) => {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    });

    throw error;
  }
}

/**
 * Atomically update multiple users
 * All updates succeed or all fail
 */
export function atomicUpdateUsers(
  updates: Array<{ id: string; updates: Partial<Pick<User, 'name'>> }>
): User[] {
  return atomicTransaction(() => {
    const results: User[] = [];

    for (const { id, updates: userUpdates } of updates) {
      const updated = updateUser(id, userUpdates);
      if (!updated) {
        throw new StorageError(`Failed to update user with ID: ${id}`);
      }
      results.push(updated);
    }

    return results;
  });
}

/**
 * Atomically create user and initial session
 */
export function atomicCreateUserWithSession(
  name: string,
  settings: Settings
): { user: User; session: Session } {
  return atomicTransaction(() => {
    const user = createUser(name);
    const session = createSession(user.id, settings);
    return { user, session };
  });
}

/**
 * Atomically delete user and all sessions
 * More efficient than separate operations
 */
export function atomicDeleteUserAndSessions(userId: string): boolean {
  return atomicTransaction(() => {
    const deleted = deleteUser(userId);
    if (!deleted) {
      return false;
    }
    return true;
  });
}

// ============================================================================
// SCHEMA MIGRATION SUPPORT
// ============================================================================

const CURRENT_SCHEMA_VERSION = 1;
const SCHEMA_VERSION_KEY = 'flash-cards-schema-version';

/**
 * Gets the current schema version from storage
 */
export function getSchemaVersion(): number {
  const version = localStorage.getItem(SCHEMA_VERSION_KEY);
  return version ? parseInt(version, 10) : 0;
}

/**
 * Sets the schema version in storage
 */
function setSchemaVersion(version: number): void {
  localStorage.setItem(SCHEMA_VERSION_KEY, version.toString());
}

/**
 * Migration function type
 */
type MigrationFunction = () => void;

/**
 * Schema migrations registry
 * Add new migrations as schema evolves
 */
const migrations: Record<number, MigrationFunction> = {
  1: () => {
    // Migration to version 1 (initial schema)
    // Ensure all keys exist with defaults
    if (!localStorage.getItem(StorageKeys.USERS)) {
      safeStore(StorageKeys.USERS, []);
    }
    if (!localStorage.getItem(StorageKeys.SETTINGS)) {
      safeStore(StorageKeys.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(StorageKeys.SESSIONS)) {
      safeStore(StorageKeys.SESSIONS, []);
    }
  },
};

/**
 * Runs all pending migrations
 * Safe to call on every app startup
 */
export function runMigrations(): void {
  const currentVersion = getSchemaVersion();

  if (currentVersion === CURRENT_SCHEMA_VERSION) {
    return; // Already up to date
  }

  try {
    // Run migrations in order
    for (let version = currentVersion + 1; version <= CURRENT_SCHEMA_VERSION; version++) {
      const migration = migrations[version];
      if (migration) {
        console.log(`[Storage] Running migration to version ${version}`);
        migration();
        setSchemaVersion(version);
      }
    }

    console.log(`[Storage] Migrations complete. Current version: ${CURRENT_SCHEMA_VERSION}`);
  } catch (error) {
    console.error('[Storage] Migration failed:', error);
    throw new StorageError('Failed to migrate storage schema', error);
  }
}

/**
 * Validates the current schema and runs migrations if needed
 * Should be called on app initialization
 */
export function initializeStorage(): void {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  runMigrations();
}

// ============================================================================
// ENHANCED CRUD WITH SYNC
// ============================================================================

/**
 * Enhanced storage operations that include multi-tab synchronization
 * Export for use in advanced scenarios
 */
export function safeStoreEnhanced(key: string, value: unknown): void {
  safeStore(key, value);
  broadcastChange(key, value);
}
