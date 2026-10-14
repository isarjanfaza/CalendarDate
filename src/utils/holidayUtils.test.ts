/**
 * Tests for holiday utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateHolidayEntry,
  validateHolidaysSchema,
  deduplicateHolidays,
  expandRecurringHolidays,
  resolveHolidays,
  getHolidayForDate,
  parseHolidays,
  isWeekend,
  HolidayValidationError,
} from './holidayUtils';
import type { HolidayEntry } from '../types';

describe('validateHolidayEntry', () => {
  it('should validate valid holiday entry', () => {
    const entry = {
      date: '2026-07-20',
      calendar: 'gregorian' as const,
      title: 'My Birthday',
      recurring: false,
    };
    const result = validateHolidayEntry(entry, 0);
    expect(result.date).toBe(entry.date);
    expect(result.calendar).toBe(entry.calendar);
    expect(result.title).toBe(entry.title);
    expect(result.recurring).toBe(entry.recurring);
    expect(result.type).toBe('personal'); // default value
  });

  it('should throw error for missing date', () => {
    const entry = { calendar: 'gregorian', title: 'Test', recurring: false };
    expect(() => validateHolidayEntry(entry, 0)).toThrow(HolidayValidationError);
  });

  it('should throw error for invalid calendar', () => {
    const entry = { date: '2026-07-20', calendar: 'invalid', title: 'Test', recurring: false };
    expect(() => validateHolidayEntry(entry, 0)).toThrow(HolidayValidationError);
  });

  it('should throw error for missing title', () => {
    const entry = { date: '2026-07-20', calendar: 'gregorian', recurring: false };
    expect(() => validateHolidayEntry(entry, 0)).toThrow(HolidayValidationError);
  });

  it('should throw error for invalid recurring', () => {
    const entry = {
      date: '2026-07-20',
      calendar: 'gregorian' as const,
      title: 'Test',
      recurring: 'true' as unknown as boolean,
    };
    expect(() => validateHolidayEntry(entry, 0)).toThrow(HolidayValidationError);
  });
});

describe('validateHolidaysSchema', () => {
  it('should validate valid schema', () => {
    const schema = {
      holidays: [
        {
          date: '2026-07-20',
          calendar: 'gregorian' as const,
          title: 'My Birthday',
          recurring: false,
        },
      ],
    };
    const result = validateHolidaysSchema(schema);
    expect(result.holidays).toHaveLength(1);
  });

  it('should throw error for non-object schema', () => {
    expect(() => validateHolidaysSchema(null)).toThrow();
    expect(() => validateHolidaysSchema('invalid')).toThrow();
  });

  it('should throw error for missing holidays array', () => {
    expect(() => validateHolidaysSchema({})).toThrow();
  });

  it('should validate weekends array', () => {
    const schema = {
      holidays: [],
      weekends: [0, 6],
    };
    const result = validateHolidaysSchema(schema);
    expect(result.weekends).toEqual([0, 6]);
  });

  it('should throw error for invalid weekends', () => {
    const schema = {
      holidays: [],
      weekends: [7], // Invalid day
    };
    expect(() => validateHolidaysSchema(schema)).toThrow();
  });
});

describe('deduplicateHolidays', () => {
  it('should remove duplicate holidays', () => {
    const holidays: HolidayEntry[] = [
      {
        date: '2026-07-20',
        calendar: 'gregorian',
        title: 'My Birthday',
        recurring: false,
      },
      {
        date: '2026-07-20',
        calendar: 'gregorian',
        title: 'My Birthday',
        recurring: false,
      },
    ];
    const result = deduplicateHolidays(holidays);
    expect(result).toHaveLength(1);
  });

  it('should keep unique holidays', () => {
    const holidays: HolidayEntry[] = [
      {
        date: '2026-07-20',
        calendar: 'gregorian',
        title: 'My Birthday',
        recurring: false,
      },
      {
        date: '2026-07-21',
        calendar: 'gregorian',
        title: 'Test',
        recurring: false,
      },
    ];
    const result = deduplicateHolidays(holidays);
    expect(result).toHaveLength(2);
  });
});

describe('expandRecurringHolidays', () => {
  it('should expand recurring holidays for year', () => {
    const holidays: HolidayEntry[] = [
      {
        date: '07/20',
        calendar: 'gregorian',
        title: 'My Birthday (Annual)',
        recurring: true,
      },
    ];
    const result = expandRecurringHolidays(holidays, 2026);
    expect(result[0].date).toBe('2026-07-20');
  });

  it('should keep non-recurring holidays as is', () => {
    const holidays: HolidayEntry[] = [
      {
        date: '2026-07-20',
        calendar: 'gregorian',
        title: 'My Birthday',
        recurring: false,
      },
    ];
    const result = expandRecurringHolidays(holidays, 2026);
    expect(result[0].date).toBe('2026-07-20');
  });
});

describe('resolveHolidays', () => {
  it('should build lookup map', () => {
    const holidays: HolidayEntry[] = [
      {
        date: '07/20',
        calendar: 'gregorian',
        title: 'My Birthday (Annual)',
        recurring: true,
      },
    ];
    const maps = resolveHolidays(holidays, 2026);
    expect(maps.exactDateMap.size).toBeGreaterThan(0);
  });

  it('should handle invalid dates gracefully', () => {
    const holidays: HolidayEntry[] = [
      {
        date: 'invalid',
        calendar: 'gregorian',
        title: 'Test',
        recurring: false,
      },
    ];
    const maps = resolveHolidays(holidays, 2026);
    expect(maps.exactDateMap.size).toBe(0);
  });
});

describe('getHolidayForDate', () => {
  it('should return holiday for matching date', () => {
    const holidays: HolidayEntry[] = [
      {
        date: '2026-07-20',
        calendar: 'gregorian',
        title: 'My Birthday',
        recurring: false,
      },
    ];
    const maps = resolveHolidays(holidays, 2026);
    const date = new Date(2026, 6, 20); // July 20, 2026
    const result = getHolidayForDate(date, maps);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBe('My Birthday');
  });

  it('should return empty array for non-holiday', () => {
    const holidays: HolidayEntry[] = [
      {
        date: '07/20',
        calendar: 'gregorian',
        title: 'My Birthday',
        recurring: true,
      },
    ];
    const maps = resolveHolidays(holidays, 2026);
    const date = new Date(2026, 7, 1); // August 1, 2026
    const result = getHolidayForDate(date, maps);
    expect(result).toEqual([]);
  });
});

describe('parseHolidays', () => {
  it('should parse valid JSON', () => {
    const json = JSON.stringify({
      holidays: [
        {
          date: '2026-07-20',
          calendar: 'gregorian',
          title: 'My Birthday',
          recurring: false,
        },
      ],
    });
    const result = parseHolidays(json);
    expect(result.holidays).toHaveLength(1);
  });

  it('should throw error for invalid JSON', () => {
    expect(() => parseHolidays('invalid json')).toThrow();
  });

  it('should throw error for invalid schema', () => {
    const json = JSON.stringify({ holidays: 'invalid' });
    expect(() => parseHolidays(json)).toThrow();
  });
});

describe('isWeekend', () => {
  it('should identify Sunday as weekend', () => {
    const sunday = new Date(2026, 9, 11); // Sunday
    expect(isWeekend(sunday, [0])).toBe(true);
  });

  it('should identify Monday as not weekend', () => {
    const monday = new Date(2026, 9, 12); // Monday
    expect(isWeekend(monday, [0])).toBe(false);
  });

  it('should handle custom weekend days', () => {
    const friday = new Date(2026, 9, 9); // Friday
    expect(isWeekend(friday, [5, 6])).toBe(true);
  });
});
