/**
 * Validation utilities for user input and application data.
 *
 * Provides validation functions for:
 * - User names
 * - Settings
 * - Answers
 * - Number ranges
 */

import type { Settings } from '../types';

/**
 * Result of a validation operation.
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a user name.
 *
 * Rules:
 * - Must be a string
 * - Must not be empty after trimming
 * - Must be 100 characters or less
 * - Must not contain only whitespace
 * - Can contain letters, numbers, spaces, and common punctuation
 *
 * @param name - User name to validate
 * @returns Validation result
 */
export function validateUserName(name: unknown): ValidationResult {
  if (typeof name !== 'string') {
    return {
      isValid: false,
      error: 'Name must be a string',
    };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Name cannot be empty',
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: 'Name must be 100 characters or less',
    };
  }

  const validNamePattern = /^[a-zA-Z0-9\s\-',.]+$/;
  if (!validNamePattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, numbers, spaces, and common punctuation',
    };
  }

  return { isValid: true };
}

/**
 * Validates settings object.
 *
 * @param settings - Settings to validate
 * @returns Validation result
 */
export function validateSettings(settings: unknown): ValidationResult {
  if (!settings || typeof settings !== 'object') {
    return {
      isValid: false,
      error: 'Settings must be an object',
    };
  }

  const s = settings as Partial<Settings>;

  if (!Array.isArray(s.includedNumbers)) {
    return {
      isValid: false,
      error: 'includedNumbers must be an array',
    };
  }

  if (s.includedNumbers.length === 0) {
    return {
      isValid: false,
      error: 'At least one number must be included',
    };
  }

  for (const num of s.includedNumbers) {
    if (typeof num !== 'number' || !Number.isInteger(num) || num < 1 || num > 12) {
      return {
        isValid: false,
        error: 'includedNumbers must only contain integers from 1 to 12',
      };
    }
  }

  const uniqueNumbers = new Set(s.includedNumbers);
  if (uniqueNumbers.size !== s.includedNumbers.length) {
    return {
      isValid: false,
      error: 'includedNumbers must not contain duplicates',
    };
  }

  if (
    typeof s.cardsPerSession !== 'number' ||
    !Number.isInteger(s.cardsPerSession)
  ) {
    return {
      isValid: false,
      error: 'cardsPerSession must be an integer',
    };
  }

  if (s.cardsPerSession < 1 || s.cardsPerSession > 100) {
    return {
      isValid: false,
      error: 'cardsPerSession must be between 1 and 100',
    };
  }

  if (typeof s.timeLimit !== 'number' || !Number.isInteger(s.timeLimit)) {
    return {
      isValid: false,
      error: 'timeLimit must be an integer',
    };
  }

  if (s.timeLimit < 1 || s.timeLimit > 3600) {
    return {
      isValid: false,
      error: 'timeLimit must be between 1 and 3600 seconds',
    };
  }

  return { isValid: true };
}

/**
 * Validates an answer string from user input.
 *
 * Rules:
 * - Must be a string
 * - Must contain only digits
 * - Must not be empty
 * - Must be parseable as an integer
 * - Must be non-negative
 * - Must be within reasonable range (0-144 for multiplication tables up to 12x12)
 *
 * @param answer - Answer string to validate
 * @returns Validation result
 */
export function validateAnswer(answer: unknown): ValidationResult {
  if (typeof answer !== 'string') {
    return {
      isValid: false,
      error: 'Answer must be a string',
    };
  }

  if (answer.trim().length === 0) {
    return {
      isValid: false,
      error: 'Answer cannot be empty',
    };
  }

  const digitsOnly = /^\d+$/;
  if (!digitsOnly.test(answer)) {
    return {
      isValid: false,
      error: 'Answer must contain only digits',
    };
  }

  const parsed = parseInt(answer, 10);

  if (isNaN(parsed)) {
    return {
      isValid: false,
      error: 'Answer must be a valid number',
    };
  }

  if (parsed < 0) {
    return {
      isValid: false,
      error: 'Answer must be non-negative',
    };
  }

  if (parsed > 999) {
    return {
      isValid: false,
      error: 'Answer is too large',
    };
  }

  return { isValid: true };
}

/**
 * Validates that a number is within a specified range.
 *
 * @param value - Value to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param fieldName - Name of the field for error messages
 * @returns Validation result
 */
export function validateNumberRange(
  value: unknown,
  min: number,
  max: number,
  fieldName = 'Value'
): ValidationResult {
  if (typeof value !== 'number') {
    return {
      isValid: false,
      error: `${fieldName} must be a number`,
    };
  }

  if (isNaN(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (!Number.isFinite(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be a finite number`,
    };
  }

  if (value < min || value > max) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates that a number is a positive integer.
 *
 * @param value - Value to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result
 */
export function validatePositiveInteger(
  value: unknown,
  fieldName = 'Value'
): ValidationResult {
  if (typeof value !== 'number') {
    return {
      isValid: false,
      error: `${fieldName} must be a number`,
    };
  }

  if (!Number.isInteger(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be an integer`,
    };
  }

  if (value < 1) {
    return {
      isValid: false,
      error: `${fieldName} must be positive`,
    };
  }

  return { isValid: true };
}

/**
 * Validates that a value is not null or undefined.
 *
 * @param value - Value to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result
 */
export function validateRequired(
  value: unknown,
  fieldName = 'Value'
): ValidationResult {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty`,
    };
  }

  return { isValid: true };
}

/**
 * Validates an email address format.
 *
 * @param email - Email to validate
 * @returns Validation result
 */
export function validateEmail(email: unknown): ValidationResult {
  if (typeof email !== 'string') {
    return {
      isValid: false,
      error: 'Email must be a string',
    };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Email cannot be empty',
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'Email must be a valid email address',
    };
  }

  return { isValid: true };
}

/**
 * Combines multiple validation results.
 * Returns first error encountered or success if all valid.
 *
 * @param results - Array of validation results
 * @returns Combined validation result
 */
export function combineValidationResults(
  results: ValidationResult[]
): ValidationResult {
  for (const result of results) {
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
}
