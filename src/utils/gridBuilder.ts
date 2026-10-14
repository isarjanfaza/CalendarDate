/**
 * CalendarDate - Pure calendar grid builder (Gregorian only)
 */

import type { CalendarDay, CalendarGrid, EventEntry, HolidayEntry } from '../types';
import {
  getMonthStart,
  getMonthEnd,
  getDayOfWeek,
  addDays,
  isToday,
  isSameDay,
  formatGregorian,
} from './dateUtils';
import { getHolidayForDate, isWeekend } from './holidayUtils';

/**
 * Grid builder options
 */
export interface GridBuilderOptions {
  weekendDays: number[];
  holidayMaps: {
    exactDateMap: Map<string, HolidayEntry[]>;
  };
  events: EventEntry[];
  weekStart: number;
}

/**
 * Build calendar grid for a given Gregorian month
 */
export function buildCalendarGrid(
  year: number,
  month: number,
  options: GridBuilderOptions,
): CalendarGrid {
  const { weekendDays, holidayMaps, events, weekStart } = options;

  // Get the first and last day of the Gregorian month
  const monthStart = getMonthStart(year, month);
  const monthEnd = getMonthEnd(year, month);

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

    // Check if this day is in the current Gregorian month
    const isCurrentMonth = currentDate.getFullYear() === year && currentDate.getMonth() === month - 1;

    // Check if today
    const isTodayDate = isToday(currentDate);

    // Check if weekend
    const isWeekendDay = isWeekend(currentDate, weekendDays);

    // Check if holiday (returns array)
    const holidays = getHolidayForDate(currentDate, holidayMaps);
    const isHolidayDay = holidays.some(h => h.holiday === true) || isWeekendDay;

    // Get events for this day
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, currentDate);
    });

    // Check if first of month
    const isFirstOfMonth = currentDate.getDate() === 1;

    days.push({
      gregorianDate: currentDate,
      gregorianIso,
      isToday: isTodayDate,
      isCurrentMonth,
      isWeekend: isWeekendDay,
      isHoliday: isHolidayDay,
      holidays: holidays.length > 0 ? holidays : undefined,
      events: dayEvents,
      isFirstOfMonth,
    });
  }

  // Calculate weeks count
  const weeksCount = Math.ceil(days.length / 7);

  return {
    year,
    month,
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
  return buildCalendarGrid(today.getFullYear(), today.getMonth() + 1, options);
}

/**
 * Get grid for a specific date
 */
export function getDateMonthGrid(
  date: Date,
  options: GridBuilderOptions,
): CalendarGrid {
  return buildCalendarGrid(date.getFullYear(), date.getMonth() + 1, options);
}

/**
 * Find a day in the grid by Gregorian ISO date
 */
export function findDayInGrid(grid: CalendarGrid, gregorianIso: string): CalendarDay | undefined {
  return grid.days.find((day) => day.gregorianIso === gregorianIso);
}
