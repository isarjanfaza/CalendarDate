/**
 * CalendarDate - Gregorian Calendar Widget
 * Framework-agnostic vanilla TypeScript library
 */

// Main exports
export { DualCalendar, createDualCalendar } from './DualCalendar';

// Types
export type {
  CalendarType,
  HolidayType,
  WeekdayIndex,
  DualCalTheme,
  HolidayEntry,
  EventEntry,
  HolidaysSchema,
  DualCalendarOptions,
  CalendarDay,
  CalendarGrid,
  Locale,
} from './types';

// Constants
export {
  GREGORIAN_MONTHS_SHORT,
  GREGORIAN_MONTHS_FULL,
  WEEKDAYS_SHORT,
  WEEKDAYS_FULL,
} from './types';

// i18n
export { getTranslations, getMonthName, getWeekdayName } from './i18n/translations';
export type { Translations } from './i18n/translations';

// Date utilities (for advanced usage)
export {
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
  type GridBuilderOptions,
} from './utils/gridBuilder';

// DOM renderer (for custom rendering)
export {
  renderCalendar,
  updateGrid,
} from './renderer/domRenderer';
