/**
 * CalendarDate - Gregorian Calendar Widget
 * Type definitions
 */

/**
 * Calendar type for holiday entries
 */
export type CalendarType = 'gregorian';

/**
 * Locale type for internationalization
 */
export type Locale = 'en' | 'fr' | 'de';

/**
 * Holiday type category
 */
export type HolidayType = 'official' | 'religious' | 'national' | 'international' | 'historical' | 'personal';

/**
 * Weekday index (0 = Sunday, 6 = Saturday)
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
  dayColor?: string;
  holidayBg?: string;
  holidayColor?: string;
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
  date: string; // "01/20" for recurring, "2026-10-10" for exact date (Gregorian ISO format)
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
 * Holidays schema
 */
export interface HolidaysSchema {
  holidays: HolidayEntry[];
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
  monthListMode?: 'popover' | 'inline';
  locale?: Locale;
  onDayClick?: (date: Date) => void;
  onMonthChange?: (grid: CalendarGrid) => void;
}

/**
 * Calendar day cell data
 */
export interface CalendarDay {
  gregorianDate: Date;
  gregorianIso: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidays?: HolidayEntry[]; // Array of all holidays for this day
  events: EventEntry[];
  isFirstOfMonth: boolean;
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
 * @deprecated Use getMonthName() from i18n/translations instead
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
 * @deprecated Use getMonthName() from i18n/translations instead
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

/**
 * @deprecated Use getWeekdayName() from i18n/translations instead
 */
export const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * @deprecated Use getWeekdayName() from i18n/translations instead
 */
export const WEEKDAYS_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
