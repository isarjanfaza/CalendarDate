/**
 * dualcal - Persian (Jalali) + Gregorian Calendar Widget
 * Type definitions
 */

/**
 * Calendar type for holiday entries
 */
export type CalendarType = 'jalali' | 'gregorian' | 'hijri';

/**
 * Holiday type category
 */
export type HolidayType = 'official' | 'religious' | 'national' | 'international' | 'historical' | 'personal';

/**
 * Gregorian digits display option
 */
export type GregorianDigits = 'latin' | 'persian';

/**
 * Weekday index (0 = Saturday, 6 = Friday in RTL context)
 */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Theme configuration
 */
export interface DualCalTheme {
  outerBg?: string;
  outerBorder?: string;
  outerRadius?: string;
  innerBg?: string;
  innerRadius?: string;
  headerColor?: string;
  subheaderColor?: string;
  weekdayBg?: string;
  weekdayText?: string;
  weekdayRadius?: string;
  dayJalaliColor?: string;
  dayGregorianColor?: string;
  dayHijriColor?: string;
  holidayBg?: string;
  holidayJalaliColor?: string;
  holidayGregorianColor?: string;
  holidayHijriColor?: string;
  todayBorder?: string;
  todayBorderWidth?: string;
  navColor?: string;
  navHover?: string;
  todayBtnBg?: string;
  todayBtnText?: string;
  todayBtnHover?: string;
  fontFamily?: string;
}

/**
 * Holiday entry
 */
export interface HolidayEntry {
  date: string; // "01/20" for recurring Jalali, "1405/07/20" for exact Jalali, "2026-10-10" for Gregorian, "01/20" for recurring Hijri
  calendar: CalendarType;
  title: string;
  recurring: boolean;
  type?: HolidayType;
  description?: string;
  holiday?: boolean; // true = holiday (red cell), false = non-holiday (normal cell, only in list)
}

/**
 * Event entry
 */
export interface EventEntry {
  date: string; // Gregorian ISO string "2026-10-10"
  title: string;
  color?: string;
}

/**
 * Hijri override entry
 */
export interface HijriOverride {
  hijri: string; // "MM/DD" Hijri month/day
  date: string; // "1405/07/20" Jalali or "2026-10-10" Gregorian
}

/**
 * Hijri configuration
 */
export interface HijriConfig {
  offset?: number; // Day offset for Hijri calendar (default: 0)
  monthStarts?: Record<string, string>; // "YYYY-MM" Hijri month -> Gregorian ISO start date (optional precision data)
  overrides?: HijriOverride[]; // Specific year overrides
}

/**
 * Holidays schema
 */
export interface HolidaysSchema {
  holidays: HolidayEntry[];
  hijri?: HijriConfig;
  weekends?: number[];
  weekStart?: number;
}

/**
 * Calendar options
 */
export interface DualCalendarOptions {
  holidays?: HolidayEntry[] | string;
  weekendDays?: number[];
  initialDate?: Date | string;
  events?: EventEntry[];
  theme?: Partial<DualCalTheme>;
  showHijri?: boolean;
  gregorianDigits?: GregorianDigits;
  monthListMode?: 'popover' | 'inline';
  onDayClick?: (date: Date, jalaliDate: JalaaliDate) => void;
  onMonthChange?: (grid: CalendarGrid) => void;
}

/**
 * Jalaali date components
 */
export interface JalaaliDate {
  jy: number; // Jalali year
  jm: number; // Jalali month (1-12)
  jd: number; // Jalali day (1-31)
}

/**
 * Calendar day cell data
 */
export interface CalendarDay {
  gregorianDate: Date;
  gregorianIso: string;
  jalaliDate: JalaaliDate;
  hijriDate?: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidays?: HolidayEntry[]; // Array of all holidays for this day
  events: EventEntry[];
  isJalaliFirst: boolean;
  isGregorianFirst: boolean;
}

/**
 * Calendar grid data
 */
export interface CalendarGrid {
  year: number;
  month: number;
  days: CalendarDay[];
  weekStart: number;
  weeksCount: number;
}

/**
 * Persian month names
 */
export const PERSIAN_MONTHS = [
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
] as const;

/**
 * Persian weekday names (short)
 */
export const PERSIAN_WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;

/**
 * Persian weekday names (full)
 */
export const PERSIAN_WEEKDAYS_FULL = [
  'شنبه',
  'یک‌شنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
] as const;

/**
 * Gregorian month names (short)
 */
export const GREGORIAN_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * Gregorian month names (full)
 */
export const GREGORIAN_MONTHS_FULL = [
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
] as const;
