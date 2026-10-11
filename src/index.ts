/**
 * dualcal - Persian (Jalali) + Gregorian Calendar Widget
 * Framework-agnostic vanilla TypeScript library
 */

// Main exports
export { DualCalendar, createDualCalendar } from './DualCalendar';

// Types
export type {
  CalendarType,
  HolidayType,
  GregorianDigits,
  WeekdayIndex,
  DualCalTheme,
  HolidayEntry,
  EventEntry,
  HolidaysSchema,
  DualCalendarOptions,
  JalaaliDate,
  CalendarDay,
  CalendarGrid,
} from './types';

// Constants
export {
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS_SHORT,
  PERSIAN_WEEKDAYS_FULL,
  GREGORIAN_MONTHS_SHORT,
  GREGORIAN_MONTHS_FULL,
} from './types';

// Date utilities (for advanced usage)
export {
  parseDate,
  toJalaaliDate,
  fromJalaaliDate,
  formatJalaali,
  formatGregorian,
  getHijriDate,
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
} from './utils/dateUtils';

// Holiday utilities
export {
  validateHolidayEntry,
  validateHolidaysSchema,
  deduplicateHolidays,
  expandRecurringHolidays,
  resolveHolidays,
  getHolidayForDate,
  fetchHolidays,
  parseHolidays,
  isWeekend,
  HolidayValidationError,
} from './utils/holidayUtils';

// Grid builder (for custom rendering)
export {
  buildCalendarGrid,
  getNextMonthGrid,
  getPrevMonthGrid,
  getTodayMonthGrid,
  getDateMonthGrid,
  findDayInGrid,
  findDayInGridByJalaali,
  type GridBuilderOptions,
} from './utils/gridBuilder';

// DOM renderer (for custom rendering)
export {
  renderCalendar,
  updateGrid,
} from './renderer/domRenderer';
