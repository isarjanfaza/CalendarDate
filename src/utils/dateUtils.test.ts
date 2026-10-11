/**
 * Tests for date utilities
 */

import { describe, it, expect } from 'vitest';
import {
  parseDate,
  toJalaaliDate,
  fromJalaaliDate,
  formatJalaali,
  formatGregorian,
  toPersianDigits,
  toLatinDigits,
  isJalaaliLeapYear,
  getJalaaliMonthLength,
  getDayOfWeek,
  addDays,
  addMonths,
  getJalaaliMonthStart,
  getJalaaliMonthEnd,
  isSameDay,
  isToday,
  validateHolidayDate,
  normalizeHolidayDate,
  getJalaaliMonthName,
  getGregorianMonthName,
  hasIslamicCalendarSupport,
  getHijriMonthDay,
  validateHijriDate,
  parseHijriDate,
} from './dateUtils';

describe('parseDate', () => {
  it('should parse Date object', () => {
    const date = new Date(2026, 9, 10); // October 10, 2026
    const result = parseDate(date);
    expect(result).toEqual(date);
  });

  it('should parse Jalali date string', () => {
    const result = parseDate('1405/07/20');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(9); // October (0-indexed)
    expect(result.getDate()).toBeCloseTo(12, 0); // October 12, 2026 (adjusted)
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

  it('should throw error for invalid Jalali date', () => {
    expect(() => parseDate('1405/13/01')).toThrow(); // Invalid month
  });
});

describe('toJalaaliDate', () => {
  it('should convert Gregorian to Jalaali', () => {
    const date = new Date(2026, 9, 10); // October 10, 2026
    const result = toJalaaliDate(date);
    expect(result.jy).toBe(1405);
    expect(result.jm).toBe(7);
    expect(result.jd).toBe(18);
  });
});

describe('fromJalaaliDate', () => {
  it('should convert Jalaali to Gregorian', () => {
    const jalaali = { jy: 1405, jm: 7, jd: 18 };
    const result = fromJalaaliDate(jalaali);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(9);
    expect(result.getDate()).toBe(10);
  });

  it('should throw error for invalid Jalaali date', () => {
    const invalid = { jy: 1405, jm: 13, jd: 1 };
    expect(() => fromJalaaliDate(invalid)).toThrow();
  });
});

describe('formatJalaali', () => {
  it('should format Jalaali date as string', () => {
    const jalaali = { jy: 1405, jm: 7, jd: 18 };
    const result = formatJalaali(jalaali);
    expect(result).toBe('1405/07/18');
  });
});

describe('formatGregorian', () => {
  it('should format Gregorian date as ISO string', () => {
    const date = new Date(2026, 9, 10);
    const result = formatGregorian(date);
    expect(result).toBe('2026-10-10');
  });
});

describe('toPersianDigits', () => {
  it('should convert Latin digits to Persian', () => {
    expect(toPersianDigits('1405')).toBe('۱۴۰۵');
    expect(toPersianDigits('2026-10-10')).toBe('۲۰۲۶-۱۰-۱۰');
  });
});

describe('toLatinDigits', () => {
  it('should convert Persian digits to Latin', () => {
    expect(toLatinDigits('۱۴۰۵')).toBe('1405');
    expect(toLatinDigits('۲۰۲۶-۱۰-۱۰')).toBe('2026-10-10');
  });
});

describe('isJalaaliLeapYear', () => {
  it('should identify leap years correctly', () => {
    expect(isJalaaliLeapYear(1403)).toBe(true); // Known leap year
    expect(isJalaaliLeapYear(1408)).toBe(true); // Known leap year
    expect(isJalaaliLeapYear(1405)).toBe(false); // Not a leap year
  });
});

describe('getJalaaliMonthLength', () => {
  it('should return correct month lengths', () => {
    expect(getJalaaliMonthLength(1405, 1)).toBe(31); // Farvardin
    expect(getJalaaliMonthLength(1405, 7)).toBe(30); // Mehr
    expect(getJalaaliMonthLength(1403, 12)).toBe(30); // Esfand in leap year
    expect(getJalaaliMonthLength(1405, 12)).toBe(29); // Esfand in common year
  });
});

describe('getDayOfWeek', () => {
  it('should return correct day of week (Saturday = 0)', () => {
    // October 10, 2026 is a Saturday
    const date = new Date(2026, 9, 10);
    expect(getDayOfWeek(date)).toBe(0);

    // October 11, 2026 is a Sunday
    const sunday = new Date(2026, 9, 11);
    expect(getDayOfWeek(sunday)).toBe(1);
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

describe('getJalaaliMonthStart', () => {
  it('should return first day of Jalaali month', () => {
    const result = getJalaaliMonthStart(1405, 7);
    const jalaali = toJalaaliDate(result);
    expect(jalaali.jy).toBe(1405);
    expect(jalaali.jm).toBe(7);
    expect(jalaali.jd).toBe(1);
  });
});

describe('getJalaaliMonthEnd', () => {
  it('should return last day of Jalaali month', () => {
    const result = getJalaaliMonthEnd(1405, 7);
    const jalaali = toJalaaliDate(result);
    expect(jalaali.jy).toBe(1405);
    expect(jalaali.jm).toBe(7);
    expect(jalaali.jd).toBe(30);
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
  it('should validate Jalali date', () => {
    expect(validateHolidayDate('1405/07/20', 'jalali')).toBe(true);
    expect(validateHolidayDate('1405/13/01', 'jalali')).toBe(false);
  });

  it('should validate Gregorian date', () => {
    expect(validateHolidayDate('2026-10-10', 'gregorian')).toBe(true);
    expect(validateHolidayDate('invalid', 'gregorian')).toBe(false);
  });
});

describe('normalizeHolidayDate', () => {
  it('should normalize Jalali date to Gregorian ISO', () => {
    const result = normalizeHolidayDate('1405/07/20', 'jalali', 1405);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should normalize Gregorian date', () => {
    const result = normalizeHolidayDate('2026-10-10', 'gregorian');
    expect(result).toBe('2026-10-10');
  });
});

describe('getJalaaliMonthName', () => {
  it('should return Persian month name', () => {
    expect(getJalaaliMonthName(1)).toBe('فروردین');
    expect(getJalaaliMonthName(7)).toBe('مهر');
    expect(getJalaaliMonthName(12)).toBe('اسفند');
  });
});

describe('getGregorianMonthName', () => {
  it('should return short month name', () => {
    expect(getGregorianMonthName(0, true)).toBe('Jan');
    expect(getGregorianMonthName(9, true)).toBe('Oct');
  });

  it('should return full month name', () => {
    expect(getGregorianMonthName(0, false)).toBe('January');
    expect(getGregorianMonthName(9, false)).toBe('October');
  });
});

describe('hasIslamicCalendarSupport', () => {
  it('should return boolean for Intl support', () => {
    const result = hasIslamicCalendarSupport();
    expect(typeof result).toBe('boolean');
  });
});

describe('validateHijriDate', () => {
  it('should validate valid Hijri dates', () => {
    expect(validateHijriDate(1, 1)).toBe(true);
    expect(validateHijriDate(12, 29)).toBe(true);
  });

  it('should reject invalid month', () => {
    expect(validateHijriDate(0, 1)).toBe(false);
    expect(validateHijriDate(13, 1)).toBe(false);
  });

  it('should reject invalid day', () => {
    expect(validateHijriDate(1, 0)).toBe(false);
    expect(validateHijriDate(1, 31)).toBe(false);
    expect(validateHijriDate(13, 5)).toBe(false);
  });
});

describe('parseHijriDate', () => {
  it('should parse valid Hijri date string', () => {
    const result = parseHijriDate('01/20');
    expect(result).toEqual({ month: 1, day: 20 });
  });

  it('should parse Hijri date with leading zeros', () => {
    const result = parseHijriDate('09/15');
    expect(result).toEqual({ month: 9, day: 15 });
  });

  it('should return null for invalid format', () => {
    expect(parseHijriDate('invalid')).toBeNull();
    expect(parseHijriDate('1')).toBeNull();
  });

  it('should return null for invalid date', () => {
    expect(parseHijriDate('13/05')).toBeNull();
    expect(parseHijriDate('01/31')).toBeNull();
  });
});

describe('getHijriMonthDay', () => {
  it('should return Hijri month/day if supported', () => {
    if (!hasIslamicCalendarSupport()) {
      return;
    }
    const date = new Date();
    const result = getHijriMonthDay(date, {});
    if (result) {
      expect(result.month).toBeGreaterThanOrEqual(1);
      expect(result.month).toBeLessThanOrEqual(12);
      expect(result.day).toBeGreaterThanOrEqual(1);
      expect(result.day).toBeLessThanOrEqual(30);
    }
  });

  it('should apply offset', () => {
    if (!hasIslamicCalendarSupport()) {
      return;
    }
    const date = new Date();
    const result1 = getHijriMonthDay(date, { offset: 0 });
    const result2 = getHijriMonthDay(date, { offset: 1 });
    // With +1 offset, the day should be different
    // (exact match depends on the date)
    expect(result2).not.toEqual(result1);
  });

  it('should return null if not supported', () => {
    // This test is informational - actual behavior depends on browser
    const date = new Date();
    const result = getHijriMonthDay(date, {});
    // If not supported, result should be null
    if (!hasIslamicCalendarSupport()) {
      expect(result).toBeNull();
    }
  });
});
