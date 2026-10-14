/**
 * CalendarDate - Holiday resolution and validation (Gregorian only)
 */

import type { HolidayEntry, HolidaysSchema, CalendarType } from '../types';
import {
  validateHolidayDate,
  formatGregorian,
} from './dateUtils';

/**
 * Error class for holiday validation errors
 */
export class HolidayValidationError extends Error {
  constructor(message: string, public readonly index: number) {
    super(message);
    this.name = 'HolidayValidationError';
  }
}

/**
 * Validate a single holiday entry
 */
export function validateHolidayEntry(entry: unknown, index: number): HolidayEntry {
  if (typeof entry !== 'object' || entry === null) {
    throw new HolidayValidationError(
      `[CalendarDate] Holiday at index ${index} must be an object`,
      index,
    );
  }

  const holiday = entry as Record<string, unknown>;

  // Validate date
  if (typeof holiday.date !== 'string' || !holiday.date) {
    throw new HolidayValidationError(
      `[CalendarDate] Holiday at index ${index}: missing or invalid 'date' field`,
      index,
    );
  }

  // Validate calendar
  if (typeof holiday.calendar !== 'string' || holiday.calendar !== 'gregorian') {
    throw new HolidayValidationError(
      `[CalendarDate] Holiday at index ${index}: 'calendar' must be 'gregorian'`,
      index,
    );
  }

  // Validate title
  if (typeof holiday.title !== 'string' || !holiday.title) {
    throw new HolidayValidationError(
      `[CalendarDate] Holiday at index ${index}: missing or invalid 'title' field`,
      index,
    );
  }

  // Validate recurring
  if (typeof holiday.recurring !== 'boolean') {
    throw new HolidayValidationError(
      `[CalendarDate] Holiday at index ${index}: 'recurring' must be a boolean`,
      index,
    );
  }

  // Validate type if present
  if (holiday.type !== undefined) {
    const validTypes = ['official', 'religious', 'national', 'international', 'historical', 'personal'];
    if (typeof holiday.type !== 'string' || !validTypes.includes(holiday.type)) {
      throw new HolidayValidationError(
        `[CalendarDate] Holiday at index ${index}: 'type' must be one of: ${validTypes.join(', ')}`,
        index,
      );
    }
  }

  // Validate holiday if present
  if (
    holiday.holiday !== undefined &&
    typeof holiday.holiday !== 'boolean'
  ) {
    throw new HolidayValidationError(
      `[CalendarDate] Holiday at index ${index}: 'holiday' must be a boolean`,
      index,
    );
  }

  // Validate date format
  const calendar = holiday.calendar as CalendarType;
  if (!validateHolidayDate(holiday.date, calendar)) {
    throw new HolidayValidationError(
      `[CalendarDate] Holiday at index ${index}: invalid date format for calendar type '${calendar}'`,
      index,
    );
  }

  return {
    date: holiday.date,
    calendar,
    title: holiday.title,
    recurring: holiday.recurring,
    type: (holiday.type as 'official' | 'religious' | 'national' | 'international' | 'historical' | 'personal') || 'personal',
    description: typeof holiday.description === 'string' ? holiday.description : undefined,
    holiday: typeof holiday.holiday === 'boolean' ? holiday.holiday : true, // Default to true (holiday)
  };
}

/**
 * Validate holidays schema
 */
export function validateHolidaysSchema(schema: unknown): HolidaysSchema {
  if (typeof schema !== 'object' || schema === null) {
    throw new Error('[CalendarDate] Holidays schema must be an object');
  }

  const holidaysSchema = schema as Record<string, unknown>;

  // Validate holidays array
  if (!Array.isArray(holidaysSchema.holidays)) {
    throw new Error('[CalendarDate] Holidays schema must have a "holidays" array');
  }

  // Validate each holiday
  const validatedHolidays = holidaysSchema.holidays.map((entry, index) =>
    validateHolidayEntry(entry, index),
  );

  // Validate weekends if present
  let weekends: number[] | undefined;
  if (holidaysSchema.weekends !== undefined) {
    if (!Array.isArray(holidaysSchema.weekends)) {
      throw new Error('[CalendarDate] "weekends" must be an array of numbers');
    }
    weekends = holidaysSchema.weekends as number[];
    if (!weekends.every((w) => typeof w === 'number' && w >= 0 && w <= 6)) {
      throw new Error('[CalendarDate] "weekends" must contain numbers 0-6');
    }
  }

  // Validate weekStart if present
  let weekStart: number | undefined;
  if (holidaysSchema.weekStart !== undefined) {
    if (typeof holidaysSchema.weekStart !== 'number') {
      throw new Error('[CalendarDate] "weekStart" must be a number');
    }
    weekStart = holidaysSchema.weekStart as number;
    if (weekStart < 0 || weekStart > 6) {
      throw new Error('[CalendarDate] "weekStart" must be between 0 and 6');
    }
  }

  return {
    holidays: validatedHolidays,
    weekends,
    weekStart,
  };
}

/**
 * Deduplicate holidays by date
 */
export function deduplicateHolidays(holidays: HolidayEntry[]): HolidayEntry[] {
  const seen = new Set<string>();
  const result: HolidayEntry[] = [];

  for (const holiday of holidays) {
    const key = `${holiday.calendar}:${holiday.date}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(holiday);
    }
  }

  return result;
}

/**
 * Expand recurring holidays for a specific year
 */
export function expandRecurringHolidays(holidays: HolidayEntry[], year: number): HolidayEntry[] {
  const expanded: HolidayEntry[] = [];

  for (const holiday of holidays) {
    if (holiday.recurring) {
      // For recurring holidays, the date is MM/DD (no year)
      // We need to expand it for the given year
      const [month, day] = holiday.date.split('/').map(Number);

      // Gregorian recurring: expand to the given Gregorian year
      const gregorianYear = year;
      expanded.push({
        ...holiday,
        date: `${gregorianYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      });
    } else {
      // Non-recurring, keep as is
      expanded.push(holiday);
    }
  }

  return expanded;
}

/**
 * Resolve holidays into a map for O(1) lookup
 */
export function resolveHolidays(
  entries: HolidayEntry[],
  year: number,
): {
  exactDateMap: Map<string, HolidayEntry[]>;
} {
  const exactDateMap = new Map<string, HolidayEntry[]>();

  for (const holiday of entries) {
    if (holiday.calendar === 'gregorian') {
      if (holiday.recurring) {
        // Recurring Gregorian: will be handled by expanding for the year
        const [month, day] = holiday.date.split('/').map(Number);
        const gregorianIso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (!exactDateMap.has(gregorianIso)) {
          exactDateMap.set(gregorianIso, []);
        }
        exactDateMap.get(gregorianIso)!.push(holiday);
      } else {
        // Exact Gregorian date
        if (!exactDateMap.has(holiday.date)) {
          exactDateMap.set(holiday.date, []);
        }
        exactDateMap.get(holiday.date)!.push(holiday);
      }
    }
  }

  return { exactDateMap };
}

/**
 * Get holidays for a specific date (returns array for multiple holidays)
 */
export function getHolidayForDate(
  date: Date,
  maps: {
    exactDateMap: Map<string, HolidayEntry[]>;
  },
): HolidayEntry[] {
  const { exactDateMap } = maps;
  const holidays: HolidayEntry[] = [];

  // Check exact date map
  const isoDate = formatGregorian(date);
  const exactHolidays = exactDateMap.get(isoDate);
  if (exactHolidays) {
    holidays.push(...exactHolidays);
  }

  // Deduplicate by title
  const seen = new Set<string>();
  const uniqueHolidays: HolidayEntry[] = [];
  for (const holiday of holidays) {
    if (!seen.has(holiday.title)) {
      seen.add(holiday.title);
      uniqueHolidays.push(holiday);
    }
  }

  return uniqueHolidays;
}

/**
 * Fetch holidays from a URL
 */
export async function fetchHolidays(url: string): Promise<HolidaysSchema> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`[CalendarDate] Failed to fetch holidays from ${url}: ${response.statusText}`);
  }

  const schema = await response.json();
  return validateHolidaysSchema(schema);
}

/**
 * Parse holidays from JSON string
 */
export function parseHolidays(jsonString: string): HolidaysSchema {
  try {
    const schema = JSON.parse(jsonString);
    return validateHolidaysSchema(schema);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('[CalendarDate] Invalid JSON in holidays data');
    }
    throw error;
  }
}

/**
 * Check if a date is a weekend day
 */
export function isWeekend(date: Date, weekendDays: number[]): boolean {
  const dayOfWeek = date.getDay();
  return weekendDays.includes(dayOfWeek);
}
