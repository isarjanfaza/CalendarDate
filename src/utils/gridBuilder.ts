/**
 * dualcal - Pure calendar grid builder
 */

import type { CalendarDay, CalendarGrid, EventEntry, HolidayEntry, HijriConfig } from '../types';
import {
  toJalaaliDate,
  getJalaaliMonthStart,
  getJalaaliMonthEnd,
  getDayOfWeek,
  addDays,
  isToday,
  isSameDay,
  getHijriMonthDay,
  formatGregorian,
  toJalaali,
} from './dateUtils';
import { getHolidayForDate, isWeekend } from './holidayUtils';

/**
 * Grid builder options
 */
export interface GridBuilderOptions {
  weekendDays: number[];
  holidayMaps: {
    jalaliMap: Map<string, HolidayEntry[]>;
    hijriMap: Map<string, HolidayEntry[]>;
    exactDateMap: Map<string, HolidayEntry[]>;
  };
  hijriConfig: HijriConfig;
  events: EventEntry[];
  showHijri: boolean;
  weekStart: number;
}

/**
 * Build calendar grid for a given Jalaali month
 */
export function buildCalendarGrid(
  jy: number,
  jm: number,
  options: GridBuilderOptions,
): CalendarGrid {
  const { weekendDays, holidayMaps, hijriConfig, events, showHijri, weekStart } = options;

  // Get the first and last day of the Jalaali month
  const monthStart = getJalaaliMonthStart(jy, jm);
  const monthEnd = getJalaaliMonthEnd(jy, jm);

  // Find the first day to display (might be from previous month)
  const startDayOfWeek = getDayOfWeek(monthStart);
  const daysBeforeMonth = (startDayOfWeek - weekStart + 7) % 7;
  const gridStart = addDays(monthStart, -daysBeforeMonth);

  // Find the last day to display (might be from next month)
  const endDayOfWeek = getDayOfWeek(monthEnd);
  const daysAfterMonth = (weekStart - endDayOfWeek - 1 + 7) % 7;
  const gridEnd = addDays(monthEnd, daysAfterMonth);

  // Build the grid
  const days: CalendarDay[] = [];
  const totalDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 0; i < totalDays; i++) {
    const currentDate = addDays(gridStart, i);
    const gregorianIso = formatGregorian(currentDate);
    const jalaliDate = toJalaaliDate(currentDate);

    // Check if this day is in the current Jalaali month
    const isCurrentMonth = jalaliDate.jy === jy && jalaliDate.jm === jm;

    // Check if today
    const isTodayDate = isToday(currentDate);

    // Check if weekend
    const isWeekendDay = isWeekend(currentDate, weekendDays);

    // Check if holiday (returns array)
    const holidays = getHolidayForDate(currentDate, jalaliDate, holidayMaps, hijriConfig);
    const isHolidayDay = holidays.some(h => h.holiday === true) || isWeekendDay;

    // Get events for this day
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, currentDate);
    });

    // Get Hijri date if enabled (use adjusted date from monthStarts)
    const hijriDateObj = showHijri ? getHijriMonthDay(currentDate, hijriConfig) : null;
    const hijriDate = hijriDateObj ? `${hijriDateObj.month}/${hijriDateObj.day}` : undefined;

    // Check if first of Jalali month
    const isJalaliFirst = jalaliDate.jd === 1;

    // Check if first of Gregorian month
    const isGregorianFirst = currentDate.getDate() === 1;

    days.push({
      gregorianDate: currentDate,
      gregorianIso,
      jalaliDate,
      hijriDate,
      isToday: isTodayDate,
      isCurrentMonth,
      isWeekend: isWeekendDay,
      isHoliday: isHolidayDay,
      holidays: holidays.length > 0 ? holidays : undefined,
      events: dayEvents,
      isJalaliFirst,
      isGregorianFirst,
    });
  }

  // Calculate weeks count
  const weeksCount = Math.ceil(days.length / 7);

  return {
    year: jy,
    month: jm,
    days,
    weekStart,
    weeksCount,
  };
}

/**
 * Get grid for next month
 */
export function getNextMonthGrid(
  currentGrid: CalendarGrid,
  options: GridBuilderOptions,
): CalendarGrid {
  let nextYear = currentGrid.year;
  let nextMonth = currentGrid.month + 1;

  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear++;
  }

  return buildCalendarGrid(nextYear, nextMonth, options);
}

/**
 * Get grid for previous month
 */
export function getPrevMonthGrid(
  currentGrid: CalendarGrid,
  options: GridBuilderOptions,
): CalendarGrid {
  let prevYear = currentGrid.year;
  let prevMonth = currentGrid.month - 1;

  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear--;
  }

  return buildCalendarGrid(prevYear, prevMonth, options);
}

/**
 * Get grid for today's month
 */
export function getTodayMonthGrid(options: GridBuilderOptions): CalendarGrid {
  const today = new Date();
  const jalali = toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  return buildCalendarGrid(jalali.jy, jalali.jm, options);
}

/**
 * Get grid for a specific date
 */
export function getDateMonthGrid(
  date: Date,
  options: GridBuilderOptions,
): CalendarGrid {
  const jalali = toJalaaliDate(date);
  return buildCalendarGrid(jalali.jy, jalali.jm, options);
}

/**
 * Find a day in the grid by Gregorian ISO date
 */
export function findDayInGrid(grid: CalendarGrid, gregorianIso: string): CalendarDay | undefined {
  return grid.days.find((day) => day.gregorianIso === gregorianIso);
}

/**
 * Find a day in the grid by Jalaali date
 */
export function findDayInGridByJalaali(
  grid: CalendarGrid,
  jy: number,
  jm: number,
  jd: number,
): CalendarDay | undefined {
  return grid.days.find((day) => day.jalaliDate.jy === jy && day.jalaliDate.jm === jm && day.jalaliDate.jd === jd);
}
