/**
 * dualcal - Date utilities using jalaali-js
 */

import {
  toJalaali,
  toGregorian,
  isValidJalaaliDate,
  isLeapJalaaliYear,
  jalaaliMonthLength,
} from 'jalaali-js';

// Re-export for convenience
export { toJalaali } from 'jalaali-js';
import type { JalaaliDate, CalendarType, HijriConfig, HijriOverride, HolidayEntry } from '../types';

const ARABIC_TO_PERSIAN_MONTHS: Record<string, string> = {
  'محرم': 'محرم',
  'صفر': 'صفر',
  'ربيع الأول': 'ربیع الاول',
  'ربيع الآخر': 'ربیع الثانی',
  'جمادى الأولى': 'جمادی الاول',
  'جمادى الآخرة': 'جمادی الثانی',
  'رجب': 'رجب',
  'شعبان': 'شعبان',
  'رمضان': 'رمضان',
  'شوال': 'شوال',
  'ذو القعدة': 'ذی القعده',
  'ذو الحجة': 'ذی الحجه',
};

/**
 * Get Hijri month name from a Gregorian date
 */
export function getHijriMonthName(date: Date): string {
  const tempDate = new Date(date);
  tempDate.setDate(tempDate.getDate() - 1); // Subtract one day for Hijri offset
  
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      month: 'long',
    });
    const arabicMonth = formatter.format(tempDate);
    return ARABIC_TO_PERSIAN_MONTHS[arabicMonth] || arabicMonth;
  } catch (e) {
    console.error('Error getting Hijri month:', e);
    return '';
  }
}

/**
 * Get Hijri year from a Gregorian date
 */
export function getHijriYear(date: Date): string {
  const tempDate = new Date(date);
  tempDate.setDate(tempDate.getDate() - 1); // Subtract one day for Hijri offset
  
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
    });
    const arabicYear = formatter.format(tempDate);
    // Remove "هـ" suffix if present
    return arabicYear.replace(/\s*هـ$/, '');
  } catch (e) {
    console.error('Error getting Hijri year:', e);
    return '';
  }
}

/**
 * Parse a date string (Gregorian ISO or Jalali format)
 */
export function parseDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) {
    return dateStr;
  }

  // Check if it's a Jalali date format (YYYY/MM/DD)
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('/').map(Number);
    const jy = year;
    const jm = month;
    const jd = day;

    if (!isValidJalaaliDate(jy, jm, jd)) {
      throw new Error(`[dualcal] Invalid Jalali date: ${dateStr}`);
    }

    const gregorian = toGregorian(jy, jm, jd);
    return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
  }

  // Assume Gregorian ISO format
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error(`[dualcal] Invalid date string: ${dateStr}`);
  }

  return parsed;
}

/**
 * Convert Gregorian Date to JalaaliDate
 */
export function toJalaaliDate(date: Date): JalaaliDate {
  const jalaali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return {
    jy: jalaali.jy,
    jm: jalaali.jm,
    jd: jalaali.jd,
  };
}

/**
 * Convert JalaaliDate to Gregorian Date
 */
export function fromJalaaliDate(jalaali: JalaaliDate): Date {
  if (!isValidJalaaliDate(jalaali.jy, jalaali.jm, jalaali.jd)) {
    throw new Error(
      `[dualcal] Invalid Jalaali date: ${jalaali.jy}/${jalaali.jm}/${jalaali.jd}`,
    );
  }

  const gregorian = toGregorian(jalaali.jy, jalaali.jm, jalaali.jd);
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
}

/**
 * Format Jalaali date as string (YYYY/MM/DD)
 */
export function formatJalaali(jalaali: JalaaliDate): string {
  return `${jalaali.jy}/${String(jalaali.jm).padStart(2, '0')}/${String(jalaali.jd).padStart(2, '0')}`;
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
 * Get Hijri date using Intl API (if available)
 */
export function getHijriDate(date: Date): string | undefined {
  try {
    if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
      return undefined;
    }

    // Subtract one day to correct the offset issue
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() - 1);

    // Use Arabic locale with Islamic calendar for better accuracy
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      calendar: 'islamic-umalqura',
    });

    const parts = formatter.formatToParts(adjustedDate);
    const dayPart = parts.find((p) => p.type === 'day');

    if (dayPart) {
      // The Arabic locale already returns Arabic numerals
      return dayPart.value;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Convert Latin digits to Persian digits
 */
export function toPersianDigits(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (d) => persianDigits[parseInt(d, 10)] || d);
}

/**
 * Convert Persian digits to Latin digits
 */
export function toLatinDigits(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let result = str;
  persianDigits.forEach((persian, index) => {
    result = result.replace(new RegExp(persian, 'g'), String(index));
  });
  return result;
}

/**
 * Check if a Jalaali year is a leap year
 */
export function isJalaaliLeapYear(year: number): boolean {
  return isLeapJalaaliYear(year);
}

/**
 * Get the number of days in a Jalaali month
 */
export function getJalaaliMonthLength(year: number, month: number): number {
  return jalaaliMonthLength(year, month);
}

/**
 * Get the day of week (0 = Saturday, 6 = Friday)
 */
export function getDayOfWeek(date: Date): number {
  const day = date.getDay();
  // Convert from Sunday=0 to Saturday=0
  // Saturday(6) -> 0, Sunday(0) -> 1, Monday(1) -> 2, ..., Friday(5) -> 6
  return (day + 1) % 7;
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
 * Get the first day of a Jalaali month
 */
export function getJalaaliMonthStart(jy: number, jm: number): Date {
  if (!isValidJalaaliDate(jy, jm, 1)) {
    throw new Error(`[dualcal] Invalid Jalaali month: ${jy}/${jm}`);
  }

  const gregorian = toGregorian(jy, jm, 1);
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
}

/**
 * Get the last day of a Jalaali month
 */
export function getJalaaliMonthEnd(jy: number, jm: number): Date {
  const lastDay = jalaaliMonthLength(jy, jm);
  const gregorian = toGregorian(jy, jm, lastDay);
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
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
    if (calendar === 'jalali') {
      const parts = dateStr.split('/').map(Number);
      // Accept both full date (YYYY/MM/DD) and recurring (MM/DD)
      if (parts.length === 2) {
        const [month, day] = parts;
        return month >= 1 && month <= 12 && day >= 1 && day <= 31;
      } else if (parts.length === 3) {
        const [year, month, day] = parts;
        return isValidJalaaliDate(year, month, day);
      }
      return false;
    } else if (calendar === 'hijri') {
      const parts = dateStr.split('/').map(Number);
      // Accept both full date (YYYY/MM/DD) and recurring (MM/DD)
      if (parts.length === 2) {
        const [month, day] = parts;
        return month >= 1 && month <= 12 && day >= 1 && day <= 30;
      } else if (parts.length === 3) {
        const [year, month, day] = parts;
        return year >= 1300 && year <= 1500 && month >= 1 && month <= 12 && day >= 1 && day <= 30;
      }
      return false;
    } else {
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    }
  } catch {
    return false;
  }
}

/**
 * Normalize holiday date to Gregorian ISO string
 */
export function normalizeHolidayDate(dateStr: string, calendar: CalendarType, year?: number): string {
  if (calendar === 'jalali') {
    const parts = dateStr.split('/').map(Number);

    // If recurring (MM/DD), use the provided year
    if (parts.length === 2) {
      const [month, day] = parts;
      const actualYear = year || new Date().getFullYear();
      if (!isValidJalaaliDate(actualYear, month, day)) {
        throw new Error(`[dualcal] Invalid Jalali date: ${dateStr}`);
      }
      const gregorian = toGregorian(actualYear, month, day);
      return formatGregorian(new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd));
    } else if (parts.length === 3) {
      const [jy, jm, jd] = parts;
      const actualYear = year || jy;
      if (!isValidJalaaliDate(actualYear, jm, jd)) {
        throw new Error(`[dualcal] Invalid Jalali date: ${dateStr}`);
      }
      const gregorian = toGregorian(actualYear, jm, jd);
      return formatGregorian(new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd));
    } else {
      throw new Error(`[dualcal] Invalid Jalali date format: ${dateStr}`);
    }
  } else if (calendar === 'hijri') {
    // Hijri - convert to Gregorian using Intl API
    const parts = dateStr.split('/').map(Number);
    
    if (parts.length === 2) {
      // recurring: MM/DD
      const [month, day] = parts;
      // For Hijri, we need to find the current Hijri year
      const currentYear = new Date().getFullYear();
      // Try to convert this Hijri date to Gregorian
      // We'll search for the correct Gregorian date
      return convertHijriToGregorian(month, day, currentYear);
    } else if (parts.length === 3) {
      const [hy, hm, hd] = parts;
      return convertHijriToGregorian(hm, hd, hy);
    } else {
      throw new Error(`[dualcal] Invalid Hijri date format: ${dateStr}`);
    }
  } else {
    // Gregorian - already in ISO format or close to it
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`[dualcal] Invalid Gregorian date: ${dateStr}`);
    }
    return formatGregorian(date);
  }
}

/**
 * Convert Hijri date to Gregorian ISO string using Intl API
 * This is an approximation and may differ by 1-2 days from official Iranian lunar calendar
 */
function convertHijriToGregorian(hijriMonth: number, hijriDay: number, referenceYear: number): string {
  try {
    // Get current Hijri year from current Gregorian date
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
      calendar: 'islamic-umalqura',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    
    // Create a Hijri date string in the format that Intl can parse
    // We need to iterate through days to find the matching Gregorian date
    // This is a brute-force approach but works for browser environments
    
    // Search around the estimated Gregorian year
    const estimatedGregorianYear = referenceYear - 578;
    const startYear = estimatedGregorianYear - 1;
    const endYear = estimatedGregorianYear + 1;
    
    for (let year = startYear; year <= endYear; year++) {
      // Try each day of the year to find the Hijri match
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      
      for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
        const dParts = formatter.formatToParts(d);
        const dMonth = dParts.find(p => p.type === 'month');
        const dDay = dParts.find(p => p.type === 'day');
        
        if (dMonth && dDay) {
          const hm = parseInt(dMonth.value);
          const hd = parseInt(dDay.value);
          
          if (hm === hijriMonth && hd === hijriDay) {
            return formatGregorian(d);
          }
        }
      }
    }
    
    // Fallback: return estimated date
    const estimatedDate = new Date(estimatedGregorianYear, hijriMonth - 1, hijriDay);
    return formatGregorian(estimatedDate);
  } catch (error) {
    console.error(`[dualcal] Error converting Hijri date: ${hijriMonth}/${hijriDay}`, error);
    // Fallback: return estimated date
    const estimatedGregorianYear = referenceYear - 578;
    const estimatedDate = new Date(estimatedGregorianYear, hijriMonth - 1, hijriDay);
    return formatGregorian(estimatedDate);
  }
}

/**
 * Get Jalaali month name in Persian
 */
export function getJalaaliMonthName(month: number): string {
  const months = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];
  return months[month - 1] || '';
}

/**
 * Get Gregorian month name (short)
 */
export function getGregorianMonthName(month: number, short = true): string {
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return short ? shortMonths[month] : fullMonths[month];
}

/**
 * Feature detect Intl Islamic calendar support
 */
export function hasIslamicCalendarSupport(): boolean {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      numberingSystem: 'latn',
    });
    const testDate = new Date();
    formatter.format(testDate);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Hijri month/day from a Gregorian date using monthStarts data or Intl fallback
 * Returns { month: number, day: number, year: number } or null if not supported
 */
export function getHijriMonthDay(
  date: Date,
  hijriConfig: HijriConfig
): { month: number; day: number; year: number } | null {
  const { offset = 0, monthStarts } = hijriConfig;

  try {
    // Apply offset
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + offset);

    // If monthStarts data is available, use it for precise computation
    if (monthStarts && Object.keys(monthStarts).length > 0) {
      const hijriFromMonthStarts = getHijriFromMonthStarts(adjustedDate, monthStarts);
      if (hijriFromMonthStarts) {
        return hijriFromMonthStarts;
      }
    }

    // Fall back to Intl computation
    if (!hasIslamicCalendarSupport()) {
      return null;
    }

    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      numberingSystem: 'latn',
    });

    const parts = formatter.formatToParts(adjustedDate);
    const monthPart = parts.find(p => p.type === 'month');
    const dayPart = parts.find(p => p.type === 'day');
    const yearPart = parts.find(p => p.type === 'year');

    if (monthPart && dayPart && yearPart) {
      return {
        year: parseInt(yearPart.value),
        month: parseInt(monthPart.value),
        day: parseInt(dayPart.value),
      };
    }

    return null;
  } catch (e) {
    console.error('[dualcal] Error getting Hijri month/day:', e);
    return null;
  }
}

/**
 * Get Hijri date from monthStarts data
 * Maps Gregorian date to Hijri month/day using known month start dates
 */
function getHijriFromMonthStarts(
  date: Date,
  monthStarts: Record<string, string>
): { month: number; day: number; year: number } | null {
  const gregorianTime = date.getTime();

  // Find the Hijri month that contains this Gregorian date
  for (const [hijriMonthKey, gregorianStartStr] of Object.entries(monthStarts)) {
    const hijriParts = hijriMonthKey.split('-');
    if (hijriParts.length !== 2) continue;

    const hijriYear = parseInt(hijriParts[0]);
    const hijriMonth = parseInt(hijriParts[1]);

    const gregorianStart = new Date(gregorianStartStr);

    // If the Gregorian date is before or on the start of this month, skip
    if (gregorianTime < gregorianStart.getTime()) {
      continue;
    }

    // Find the next month's start date to determine the end of this month
    const nextMonthKey = `${hijriYear}-${hijriMonth + 1}`;
    const nextYearKey = `${hijriYear + 1}-01`;

    let nextMonthStart: Date | null = null;
    if (monthStarts[nextMonthKey]) {
      nextMonthStart = new Date(monthStarts[nextMonthKey]);
    } else if (monthStarts[nextYearKey]) {
      nextMonthStart = new Date(monthStarts[nextYearKey]);
    }

    // If we found this month and (either no next month or date is before next month)
    if (!nextMonthStart || gregorianTime < nextMonthStart.getTime()) {
      // Calculate day number (1-indexed)
      const dayDiff = Math.floor((gregorianTime - gregorianStart.getTime()) / (1000 * 60 * 60 * 24));
      return {
        year: hijriYear,
        month: hijriMonth,
        day: dayDiff + 1,
      };
    }
  }

  return null;
}

/**
 * Validate Hijri month/day (month: 1-12, day: 1-30 depending on month)
 */
export function validateHijriDate(month: number, day: number): boolean {
  if (month < 1 || month > 12) {
    return false;
  }

  // Maximum days per Hijri month (approximate)
  const maxDays = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  const maxDay = maxDays[month - 1];

  if (day < 1 || day > maxDay) {
    return false;
  }

  return true;
}

/**
 * Parse Hijri date string "MM/DD"
 */
export function parseHijriDate(dateStr: string): { month: number; day: number } | null {
  const parts = dateStr.split('/');
  if (parts.length !== 2) {
    return null;
  }

  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);

  if (isNaN(month) || isNaN(day)) {
    return null;
  }

  if (!validateHijriDate(month, day)) {
    return null;
  }

  return { month, day };
}

/**
 * Check if a Hijri override applies to a specific date
 */
export function hijriOverrideApplies(
  override: HijriOverride,
  gregorianDate: Date,
  hijriConfig: HijriConfig
): boolean {
  const { hijri: overrideHijri, date: overrideDate } = override;

  // Get the Hijri date for the current Gregorian date
  const currentHijri = getHijriMonthDay(gregorianDate, hijriConfig);
  if (!currentHijri) {
    return false;
  }

  // Check if the Hijri month/day matches the override
  const overrideHijriParts = overrideHijri.split('/').map(Number);
  if (overrideHijriParts.length !== 2) {
    return false;
  }
  const [overrideMonth, overrideDay] = overrideHijriParts;

  if (currentHijri.month !== overrideMonth || currentHijri.day !== overrideDay) {
    return false;
  }

  // Parse override date
  let overrideGregorian: Date | null = null;
  if (overrideDate.includes('/')) {
    // Assume Jalali format "1405/07/20"
    const parts = overrideDate.split('/').map(Number);
    if (parts.length === 3) {
      const [jy, jm, jd] = parts;
      const g = toGregorian(jy, jm, jd);
      overrideGregorian = new Date(g.gy, g.gm - 1, g.gd);
    }
  } else {
    // Assume Gregorian ISO format "2026-10-10"
    overrideGregorian = new Date(overrideDate);
  }

  if (!overrideGregorian) {
    return false;
  }

  // Check if the current date matches the override date
  const currentGregorian = new Date(gregorianDate);
  currentGregorian.setHours(0, 0, 0, 0);
  overrideGregorian.setHours(0, 0, 0, 0);

  return currentGregorian.getTime() === overrideGregorian.getTime();
}

/**
 * Get Hijri holidays for a specific date considering overrides
 */
export function getHijriHolidaysForDate(
  gregorianDate: Date,
  _jalaliDate: JalaaliDate,
  hijriMap: Map<string, HolidayEntry[]>,
  exactDateMap: Map<string, HolidayEntry[]>,
  hijriConfig: HijriConfig
): HolidayEntry[] {
  const holidays: HolidayEntry[] = [];
  const overrides = hijriConfig.overrides || [];

  // Get Hijri month/day for this date using the full config
  const hijriDate = getHijriMonthDay(gregorianDate, hijriConfig);
  if (!hijriDate) {
    return holidays;
  }

  const hijriKey = `${String(hijriDate.month).padStart(2, '0')}/${String(hijriDate.day).padStart(2, '0')}`;

  // Check for overrides first
  const matchingOverride = overrides.find(o =>
    hijriOverrideApplies(o, gregorianDate, hijriConfig)
  );

  if (matchingOverride) {
    // Override applies - use exact date if provided, otherwise skip
    const exactDateKey = formatGregorian(gregorianDate);
    const exactHolidays = exactDateMap.get(exactDateKey);
    if (exactHolidays) {
      holidays.push(...exactHolidays);
    }
    return holidays;
  }

  // No override - use computed Hijri match
  const hijriHolidays = hijriMap.get(hijriKey);
  if (hijriHolidays) {
    holidays.push(...hijriHolidays);
  }

  // Also check exact date map for non-recurring entries
  const exactDateKey = formatGregorian(gregorianDate);
  const exactHolidays = exactDateMap.get(exactDateKey);
  if (exactHolidays) {
    holidays.push(...exactHolidays);
  }

  return holidays;
}
