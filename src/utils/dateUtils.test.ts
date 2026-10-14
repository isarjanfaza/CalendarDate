/**
 * Tests for date utilities
 */

import { describe, it, expect } from 'vitest';
import {
  parseDate,
  formatGregorian,
  getDayOfWeek,
  addDays,
  addMonths,
  getMonthStart,
  getMonthEnd,
  isSameDay,
  isToday,
  validateHolidayDate,
  normalizeHolidayDate,
  getGregorianMonthName,
} from './dateUtils';

describe('parseDate', () => {
  it('should parse Date object', () => {
    const date = new Date(2026, 9, 10); // October 10, 2026
    const result = parseDate(date);
    expect(result).toEqual(date);
  });

  it('should parse Gregorian ISO string', () => {
    const result = parseDate('2026-10-10');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(9);
    expect(result.getDate()).toBe(10);
  });

  it('should throw error for invalid date string', () => {
    expect(() => parseDate('invalid')).toThrow();
  });
});

describe('formatGregorian', () => {
  it('should format Gregorian date as ISO string', () => {
    const date = new Date(2026, 9, 10);
    const result = formatGregorian(date);
    expect(result).toBe('2026-10-10');
  });
});

describe('getDayOfWeek', () => {
  it('should return correct day of week (Sunday = 0)', () => {
    // October 10, 2026 is a Saturday
    const date = new Date(2026, 9, 10);
    expect(getDayOfWeek(date)).toBe(6);

    // October 11, 2026 is a Sunday
    const sunday = new Date(2026, 9, 11);
    expect(getDayOfWeek(sunday)).toBe(0);
  });
});

describe('addDays', () => {
  it('should add days to date', () => {
    const date = new Date(2026, 9, 10);
    const result = addDays(date, 5);
    expect(result.getDate()).toBe(15);
  });

  it('should subtract days from date', () => {
    const date = new Date(2026, 9, 10);
    const result = addDays(date, -5);
    expect(result.getDate()).toBe(5);
  });
});

describe('addMonths', () => {
  it('should add months to date', () => {
    const date = new Date(2026, 9, 10);
    const result = addMonths(date, 2);
    expect(result.getMonth()).toBe(11); // December
  });

  it('should handle year boundary', () => {
    const date = new Date(2026, 11, 10);
    const result = addMonths(date, 1);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0);
  });
});

describe('getMonthStart', () => {
  it('should return first day of Gregorian month', () => {
    const result = getMonthStart(2026, 10);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(9); // October (0-indexed)
    expect(result.getDate()).toBe(1);
  });
});

describe('getMonthEnd', () => {
  it('should return last day of Gregorian month', () => {
    const result = getMonthEnd(2026, 10);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(9); // October (0-indexed)
    expect(result.getDate()).toBe(31);
  });
});

describe('isSameDay', () => {
  it('should return true for same day', () => {
    const date1 = new Date(2026, 9, 10);
    const date2 = new Date(2026, 9, 10);
    expect(isSameDay(date1, date2)).toBe(true);
  });

  it('should return false for different days', () => {
    const date1 = new Date(2026, 9, 10);
    const date2 = new Date(2026, 9, 11);
    expect(isSameDay(date1, date2)).toBe(false);
  });
});

describe('isToday', () => {
  it('should return true for today', () => {
    const today = new Date();
    expect(isToday(today)).toBe(true);
  });

  it('should return false for other days', () => {
    const other = new Date(2025, 9, 10); // October 10, 2025 (not today)
    expect(isToday(other)).toBe(false);
  });
});

describe('validateHolidayDate', () => {
  it('should validate Gregorian date', () => {
    expect(validateHolidayDate('2026-10-10', 'gregorian')).toBe(true);
    expect(validateHolidayDate('invalid', 'gregorian')).toBe(false);
  });
});

describe('normalizeHolidayDate', () => {
  it('should normalize Gregorian date', () => {
    const result = normalizeHolidayDate('2026-10-10', 'gregorian');
    expect(result).toBe('2026-10-10');
  });

  it('should normalize recurring Gregorian date', () => {
    const result = normalizeHolidayDate('10/10', 'gregorian', 2026);
    expect(result).toBe('2026-10-10');
  });
});

describe('getGregorianMonthName', () => {
  it('should return short month name', () => {
    expect(getGregorianMonthName(0, true, 'en')).toBe('Jan');
    expect(getGregorianMonthName(9, true, 'en')).toBe('Oct');
  });

  it('should return full month name', () => {
    expect(getGregorianMonthName(0, false, 'en')).toBe('January');
    expect(getGregorianMonthName(9, false, 'en')).toBe('October');
  });

  it('should return localized month name', () => {
    expect(getGregorianMonthName(0, false, 'fr')).toBe('Janvier');
    expect(getGregorianMonthName(0, false, 'de')).toBe('Januar');
  });
});
