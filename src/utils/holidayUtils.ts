/**
 * dualcal - Holiday resolution and validation
 */

import type { HolidayEntry, HolidaysSchema, CalendarType, HijriConfig, HijriOverride } from '../types';
import {
  validateHolidayDate,
  normalizeHolidayDate,
  formatGregorian,
  parseHijriDate,
  getHijriHolidaysForDate,
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
      `[dualcal] Holiday at index ${index} must be an object`,
      index,
    );
  }

  const holiday = entry as Record<string, unknown>;

  // Validate date
  if (typeof holiday.date !== 'string' || !holiday.date) {
    throw new HolidayValidationError(
      `[dualcal] Holiday at index ${index}: missing or invalid 'date' field`,
      index,
    );
  }

  // Validate calendar
  if (
    typeof holiday.calendar !== 'string' ||
    (holiday.calendar !== 'jalali' && holiday.calendar !== 'gregorian' && holiday.calendar !== 'hijri')
  ) {
    throw new HolidayValidationError(
      `[dualcal] Holiday at index ${index}: 'calendar' must be 'jalali', 'gregorian', or 'hijri'`,
      index,
    );
  }

  // Validate title
  if (typeof holiday.title !== 'string' || !holiday.title) {
    throw new HolidayValidationError(
      `[dualcal] Holiday at index ${index}: missing or invalid 'title' field`,
      index,
    );
  }

  // Validate recurring
  if (typeof holiday.recurring !== 'boolean') {
    throw new HolidayValidationError(
      `[dualcal] Holiday at index ${index}: 'recurring' must be a boolean`,
      index,
    );
  }

  // Validate type if present
  if (holiday.type !== undefined) {
    const validTypes = ['official', 'religious', 'national', 'international', 'historical', 'personal'];
    if (typeof holiday.type !== 'string' || !validTypes.includes(holiday.type)) {
      throw new HolidayValidationError(
        `[dualcal] Holiday at index ${index}: 'type' must be one of: ${validTypes.join(', ')}`,
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
      `[dualcal] Holiday at index ${index}: 'holiday' must be a boolean`,
      index,
    );
  }

  // Validate date format
  const calendar = holiday.calendar as CalendarType;
  if (!validateHolidayDate(holiday.date, calendar)) {
    throw new HolidayValidationError(
      `[dualcal] Holiday at index ${index}: invalid date format for calendar type '${calendar}'`,
      index,
    );
  }

  // Additional validation for Hijri dates
  if (calendar === 'hijri') {
    const hijriDate = parseHijriDate(holiday.date);
    if (!hijriDate) {
      throw new HolidayValidationError(
        `[dualcal] Holiday at index ${index}: invalid Hijri date format '${holiday.date}', expected 'MM/DD' with valid month (1-12) and day`,
        index,
      );
    }
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
    throw new Error('[dualcal] Holidays schema must be an object');
  }

  const holidaysSchema = schema as Record<string, unknown>;

  // Validate holidays array
  if (!Array.isArray(holidaysSchema.holidays)) {
    throw new Error('[dualcal] Holidays schema must have a "holidays" array');
  }

  // Validate each holiday
  const validatedHolidays = holidaysSchema.holidays.map((entry, index) =>
    validateHolidayEntry(entry, index),
  );

  // Validate hijri config if present
  let hijriConfig: HijriConfig | undefined;
  if (holidaysSchema.hijri !== undefined) {
    if (typeof holidaysSchema.hijri !== 'object' || holidaysSchema.hijri === null) {
      throw new Error('[dualcal] "hijri" must be an object');
    }
    const hijriObj = holidaysSchema.hijri as Record<string, unknown>;

    // Validate offset
    if (hijriObj.offset !== undefined) {
      if (typeof hijriObj.offset !== 'number') {
        throw new Error('[dualcal] "hijri.offset" must be a number');
      }
    }

    // Validate monthStarts (optional)
    if (hijriObj.monthStarts !== undefined) {
      if (typeof hijriObj.monthStarts !== 'object' || hijriObj.monthStarts === null) {
        throw new Error('[dualcal] "hijri.monthStarts" must be an object');
      }
      const monthStarts = hijriObj.monthStarts as Record<string, unknown>;
      for (const [key, value] of Object.entries(monthStarts)) {
        if (typeof value !== 'string') {
          throw new Error(`[dualcal] "hijri.monthStarts[${key}]" must be a string (Gregorian ISO date)`);
        }
        // Validate the date format
        try {
          new Date(value);
        } catch {
          throw new Error(`[dualcal] "hijri.monthStarts[${key}]" must be a valid Gregorian ISO date`);
        }
      }
    }

    // Validate overrides
    if (hijriObj.overrides !== undefined) {
      if (!Array.isArray(hijriObj.overrides)) {
        throw new Error('[dualcal] "hijri.overrides" must be an array');
      }
      for (const override of hijriObj.overrides) {
        if (typeof override !== 'object' || override === null) {
          throw new Error('[dualcal] Each override must be an object');
        }
        const overrideObj = override as Record<string, unknown>;
        if (typeof overrideObj.hijri !== 'string' || !overrideObj.hijri) {
          throw new Error('[dualcal] Override must have "hijri" string');
        }
        if (typeof overrideObj.date !== 'string' || !overrideObj.date) {
          throw new Error('[dualcal] Override must have "date" string');
        }
      }
    }

    hijriConfig = {
      offset: typeof hijriObj.offset === 'number' ? hijriObj.offset : 0,
      monthStarts: typeof hijriObj.monthStarts === 'object' && hijriObj.monthStarts !== null
        ? hijriObj.monthStarts as Record<string, string>
        : undefined,
      overrides: Array.isArray(hijriObj.overrides) ? hijriObj.overrides as HijriOverride[] : [],
    };
  }

  // Validate weekends if present
  let weekends: number[] | undefined;
  if (holidaysSchema.weekends !== undefined) {
    if (!Array.isArray(holidaysSchema.weekends)) {
      throw new Error('[dualcal] "weekends" must be an array of numbers');
    }
    weekends = holidaysSchema.weekends as number[];
    if (!weekends.every((w) => typeof w === 'number' && w >= 0 && w <= 6)) {
      throw new Error('[dualcal] "weekends" must contain numbers 0-6');
    }
  }

  // Validate weekStart if present
  let weekStart: number | undefined;
  if (holidaysSchema.weekStart !== undefined) {
    if (typeof holidaysSchema.weekStart !== 'number') {
      throw new Error('[dualcal] "weekStart" must be a number');
    }
    weekStart = holidaysSchema.weekStart as number;
    if (weekStart < 0 || weekStart > 6) {
      throw new Error('[dualcal] "weekStart" must be between 0 and 6');
    }
  }

  return {
    holidays: validatedHolidays,
    hijri: hijriConfig,
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

      if (holiday.calendar === 'jalali') {
        // Jalali recurring: expand to the given Jalali year
        expanded.push({
          ...holiday,
          date: `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
        });
      } else if (holiday.calendar === 'hijri') {
        // Hijri recurring: keep as MM/DD, will be converted during normalization
        // We don't add a year here because Hijri dates are converted on-the-fly
        expanded.push({
          ...holiday,
          date: `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
        });
      } else {
        // Gregorian recurring: expand to the given Gregorian year
        const gregorianYear = year;
        expanded.push({
          ...holiday,
          date: `${gregorianYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        });
      }
    } else {
      // Non-recurring, keep as is
      expanded.push(holiday);
    }
  }

  return expanded;
}

/**
 * Resolve holidays into three maps for O(1) lookup
 */
export function resolveHolidays(
  entries: HolidayEntry[],
  year: number,
  _hijriConfig: HijriConfig = {},
): {
  jalaliMap: Map<string, HolidayEntry[]>;
  hijriMap: Map<string, HolidayEntry[]>;
  exactDateMap: Map<string, HolidayEntry[]>;
} {
  const jalaliMap = new Map<string, HolidayEntry[]>();
  const hijriMap = new Map<string, HolidayEntry[]>();
  const exactDateMap = new Map<string, HolidayEntry[]>();

  for (const holiday of entries) {
    if (holiday.calendar === 'jalali') {
      if (holiday.recurring) {
        // Recurring Jalali: MM/DD
        const key = holiday.date; // Already in MM/DD format
        if (!jalaliMap.has(key)) {
          jalaliMap.set(key, []);
        }
        jalaliMap.get(key)!.push(holiday);
      } else {
        // Exact Jalali date: normalize to Gregorian ISO
        try {
          const gregorianIso = normalizeHolidayDate(holiday.date, 'jalali', year);
          if (!exactDateMap.has(gregorianIso)) {
            exactDateMap.set(gregorianIso, []);
          }
          exactDateMap.get(gregorianIso)!.push(holiday);
        } catch (error) {
          console.warn(`[dualcal] Failed to normalize Jalali holiday date: ${holiday.date}`, error);
        }
      }
    } else if (holiday.calendar === 'hijri') {
      // Hijri holidays are always recurring (MM/DD)
      const key = holiday.date; // Already in MM/DD format
      if (!hijriMap.has(key)) {
        hijriMap.set(key, []);
      }
      hijriMap.get(key)!.push(holiday);
    } else if (holiday.calendar === 'gregorian') {
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

  return { jalaliMap, hijriMap, exactDateMap };
}

/**
 * Get holidays for a specific date (returns array for multiple holidays)
 */
export function getHolidayForDate(
  date: Date,
  jalaliDate: { jy: number; jm: number; jd: number },
  maps: {
    jalaliMap: Map<string, HolidayEntry[]>;
    hijriMap: Map<string, HolidayEntry[]>;
    exactDateMap: Map<string, HolidayEntry[]>;
  },
  hijriConfig: HijriConfig = {},
): HolidayEntry[] {
  const { jalaliMap, hijriMap, exactDateMap } = maps;
  const holidays: HolidayEntry[] = [];

  // Check exact date map first (highest priority)
  const isoDate = formatGregorian(date);
  const exactHolidays = exactDateMap.get(isoDate);
  if (exactHolidays) {
    holidays.push(...exactHolidays);
  }

  // Check Jalali recurring map
  const jalaliKey = `${String(jalaliDate.jm).padStart(2, '0')}/${String(jalaliDate.jd).padStart(2, '0')}`;
  const jalaliHolidays = jalaliMap.get(jalaliKey);
  if (jalaliHolidays) {
    holidays.push(...jalaliHolidays);
  }

  // Check Hijri map if Intl support is available
  if (hijriMap.size > 0) {
    const hijriHolidays = getHijriHolidaysForDate(date, jalaliDate, hijriMap, exactDateMap, hijriConfig);
    if (hijriHolidays.length > 0) {
      holidays.push(...hijriHolidays);
    }
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
    throw new Error(`[dualcal] Failed to fetch holidays from ${url}: ${response.statusText}`);
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
      throw new Error('[dualcal] Invalid JSON in holidays data');
    }
    throw error;
  }
}

/**
 * Check if a date is a weekend day
 */
export function isWeekend(date: Date, weekendDays: number[]): boolean {
  const dayOfWeek = date.getDay();
  // Convert Sunday=0 to Saturday=0
  const adjustedDay = (dayOfWeek + 1) % 7;
  return weekendDays.includes(adjustedDay);
}
