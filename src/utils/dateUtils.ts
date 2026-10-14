/**
 * CalendarDate - Date utilities (Gregorian only)
 */

import type { CalendarType, Locale } from '../types';
import { getMonthName } from '../i18n/translations';

/**
 * Parse a date string (Gregorian ISO format)
 */
export function parseDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) {
    return dateStr;
  }

  // Assume Gregorian ISO format
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error(`[CalendarDate] Invalid date string: ${dateStr}`);
  }

  return parsed;
}

/**
 * Format Gregorian date as ISO string (YYYY-MM-DD)
 */
export function formatGregorian(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date (Gregorian)
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Get the first day of a Gregorian month
 */
export function getMonthStart(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

/**
 * Get the last day of a Gregorian month
 */
export function getMonthEnd(year: number, month: number): Date {
  return new Date(year, month, 0);
}

/**
 * Compare two dates (ignoring time)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Validate holiday date string based on calendar type
 */
export function validateHolidayDate(dateStr: string, calendar: CalendarType): boolean {
  try {
    if (calendar === 'gregorian') {
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Normalize holiday date to Gregorian ISO string
 */
export function normalizeHolidayDate(dateStr: string, calendar: CalendarType, year?: number): string {
  if (calendar === 'gregorian') {
    const parts = dateStr.split('/').map(Number);

    // If recurring (MM/DD), use the provided year
    if (parts.length === 2) {
      const [month, day] = parts;
      const actualYear = year || new Date().getFullYear();
      const date = new Date(actualYear, month - 1, day);
      if (isNaN(date.getTime())) {
        throw new Error(`[CalendarDate] Invalid Gregorian date: ${dateStr}`);
      }
      return formatGregorian(date);
    } else if (parts.length === 3) {
      // YYYY-MM-DD format
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error(`[CalendarDate] Invalid Gregorian date: ${dateStr}`);
      }
      return formatGregorian(date);
    } else {
      throw new Error(`[CalendarDate] Invalid Gregorian date format: ${dateStr}`);
    }
  }

  throw new Error(`[CalendarDate] Unsupported calendar type: ${calendar}`);
}

/**
 * Get Gregorian month name (short)
 */
export function getGregorianMonthName(month: number, short = true, locale: Locale = 'en'): string {
  return getMonthName(month, locale, short);
}
