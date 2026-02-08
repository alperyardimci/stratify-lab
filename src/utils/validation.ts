// Input validation utilities for security
// Prevents injection attacks and ensures data integrity

/**
 * Sanitize string input - removes potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>\"\'\\]/g, '') // Remove HTML/script injection chars
    .slice(0, 500); // Limit length
};

/**
 * Validate and sanitize search query
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') return '';

  return query
    .trim()
    .replace(/[^a-zA-Z0-9\s\-\.]/g, '') // Only allow alphanumeric, space, dash, dot
    .slice(0, 100); // Limit length
};

/**
 * Validate symbol/ticker format
 */
export const validateSymbol = (symbol: string): boolean => {
  if (typeof symbol !== 'string') return false;

  // Stock symbols: 1-5 uppercase letters
  // Crypto IDs: lowercase with hyphens
  // Forex pairs: XXX/XXX format
  const stockPattern = /^[A-Z]{1,5}$/;
  const cryptoPattern = /^[a-z0-9\-]{1,50}$/;
  const forexPattern = /^[A-Z]{3}\/[A-Z]{3}$/;

  return stockPattern.test(symbol) ||
         cryptoPattern.test(symbol) ||
         forexPattern.test(symbol);
};

/**
 * Sanitize symbol for API calls
 */
export const sanitizeSymbol = (symbol: string): string => {
  if (typeof symbol !== 'string') return '';

  return symbol
    .trim()
    .replace(/[^a-zA-Z0-9\-\/]/g, '')
    .slice(0, 50);
};

/**
 * Validate numeric input
 */
export const validateNumber = (value: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): boolean => {
  const num = Number(value);
  return !isNaN(num) && isFinite(num) && num >= min && num <= max;
};

/**
 * Sanitize and validate investment amount
 */
export const sanitizeAmount = (value: string | number): number => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;

  if (isNaN(num) || !isFinite(num)) return 0;

  // Limit to reasonable investment range
  return Math.min(Math.max(num, 0), 1000000000);
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  if (typeof email !== 'string') return false;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email) && email.length <= 254;
};

/**
 * Sanitize for URL parameter
 */
export const encodeURLParam = (param: string): string => {
  if (typeof param !== 'string') return '';

  return encodeURIComponent(sanitizeString(param));
};

/**
 * Validate date string format (YYYY-MM-DD)
 */
export const validateDateString = (dateStr: string): boolean => {
  if (typeof dateStr !== 'string') return false;

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateStr)) return false;

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Check if object has only allowed keys
 */
export const validateObjectKeys = (obj: Record<string, any>, allowedKeys: string[]): boolean => {
  if (typeof obj !== 'object' || obj === null) return false;

  const objKeys = Object.keys(obj);
  return objKeys.every(key => allowedKeys.includes(key));
};
