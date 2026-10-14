/**
 * CalendarDate - Core DualCalendar class (Gregorian only)
 */

import type {
  DualCalendarOptions,
  CalendarGrid,
  HolidayEntry,
  EventEntry,
  DualCalTheme,
} from './types';
import {
  parseDate,
} from './utils/dateUtils';
import {
  validateHolidaysSchema,
  resolveHolidays,
  fetchHolidays,
  parseHolidays,
} from './utils/holidayUtils';
import type { HolidaysSchema } from './types';
import {
  buildCalendarGrid,
  type GridBuilderOptions,
} from './utils/gridBuilder';
import { renderCalendar, updateHeader, updateGrid } from './renderer/domRenderer';

/**
 * DualCalendar instance
 */
export class DualCalendar {
  private container: HTMLElement;
  private options: Required<Omit<DualCalendarOptions, 'theme'>> & { theme?: DualCalTheme };
  private currentGrid!: CalendarGrid;
  private holidayMaps: {
    exactDateMap: Map<string, HolidayEntry[]>;
  };
  private rawHolidays: HolidayEntry[];
  private destroyed = false;

  constructor(container: HTMLElement, options: DualCalendarOptions = {}) {
    this.container = container;
    this.holidayMaps = {
      exactDateMap: new Map(),
    };
    this.rawHolidays = [];

    // Merge with defaults
    this.options = {
      holidays: [],
      weekendDays: [0, 6], // Saturday and Sunday
      initialDate: new Date(),
      events: [],
      monthListMode: 'popover',
      locale: 'en',
      onDayClick: () => {},
      onMonthChange: () => {},
      theme: options.theme,
    };

    // Apply user options
    if (options.holidays !== undefined) this.options.holidays = options.holidays;
    if (options.weekendDays !== undefined) this.options.weekendDays = options.weekendDays;
    if (options.initialDate !== undefined) this.options.initialDate = options.initialDate;
    if (options.events !== undefined) this.options.events = options.events;
    if (options.monthListMode !== undefined) this.options.monthListMode = options.monthListMode;
    if (options.locale !== undefined) this.options.locale = options.locale;
    if (options.onDayClick !== undefined) this.options.onDayClick = options.onDayClick;
    if (options.onMonthChange !== undefined) this.options.onMonthChange = options.onMonthChange;

    // Initialize holidays
    this.initializeHolidays().then(() => {
      // Build initial grid
      const initialDate = parseDate(this.options.initialDate);
      const year = initialDate.getFullYear();
      const month = initialDate.getMonth() + 1;
      this.currentGrid = this.buildGrid(year, month);

      // Render
      this.render();
    });
  }

  /**
   * Initialize holidays from options
   */
  private async initializeHolidays(): Promise<void> {
    const holidaysData = this.options.holidays;

    try {
      let schema: HolidaysSchema;

      if (typeof holidaysData === 'string') {
        // URL or JSON string
        if (holidaysData.startsWith('http://') || holidaysData.startsWith('https://')) {
          schema = await fetchHolidays(holidaysData);
        } else {
          schema = parseHolidays(holidaysData);
        }
      } else if (Array.isArray(holidaysData)) {
        // Array of holiday entries
        schema = validateHolidaysSchema({ holidays: holidaysData });
      } else {
        schema = { holidays: [] };
      }

      // Store the raw holidays for later resolution
      this.rawHolidays = schema.holidays;

      // Get current year for holiday resolution
      const today = new Date();
      const year = today.getFullYear();

      // Resolve holidays for current year
      this.holidayMaps = resolveHolidays(schema.holidays, year);
    } catch (error) {
      console.error('[CalendarDate] Failed to initialize holidays:', error);
      this.holidayMaps = {
        exactDateMap: new Map(),
      };
      this.rawHolidays = [];
    }
  }

  /**
   * Build calendar grid for a given Gregorian month
   */
  private buildGrid(year: number, month: number): CalendarGrid {
    // Resolve holidays for the specific year
    this.holidayMaps = resolveHolidays(this.rawHolidays, year);

    const options: GridBuilderOptions = {
      weekendDays: this.options.weekendDays,
      holidayMaps: this.holidayMaps,
      events: this.options.events,
      weekStart: 0, // Sunday
    };
    return buildCalendarGrid(year, month, options);
  }

  /**
   * Render the calendar
   */
  private render(): void {
    if (this.destroyed) return;

    // Apply theme if provided
    if (this.options.theme) {
      this.applyTheme(this.options.theme);
    }

    renderCalendar(this.container, this.currentGrid, {
      monthListMode: this.options.monthListMode,
      locale: this.options.locale,
      onDayClick: (day) => {
        this.options.onDayClick?.(day.gregorianDate);
      },
      onMonthChange: (year, month) => {
        // Navigate to selected month
        this.currentGrid = this.buildGrid(year, month);
        this.updateRender();
        this.options.onMonthChange?.(this.currentGrid);
      },
      onNextMonth: () => this.next(),
      onPrevMonth: () => this.prev(),
      onGoToToday: () => this.goToToday(),
    });
  }

  /**
   * Apply custom theme
   */
  private applyTheme(theme: DualCalTheme): void {
    const root = this.container;

    if (theme.outerBg) root.style.setProperty('--dc-outer-bg', theme.outerBg);
    if (theme.outerBorder) root.style.setProperty('--dc-outer-border', theme.outerBorder);
    if (theme.outerRadius) root.style.setProperty('--dc-outer-radius', theme.outerRadius);
    if (theme.innerBg) root.style.setProperty('--dc-inner-bg', theme.innerBg);
    if (theme.innerRadius) root.style.setProperty('--dc-inner-radius', theme.innerRadius);
    if (theme.headerColor) root.style.setProperty('--dc-header-color', theme.headerColor);
    if (theme.subheaderColor) root.style.setProperty('--dc-subheader-color', theme.subheaderColor);
    if (theme.weekdayBg) root.style.setProperty('--dc-weekday-bg', theme.weekdayBg);
    if (theme.weekdayText) root.style.setProperty('--dc-weekday-text', theme.weekdayText);
    if (theme.weekdayRadius) root.style.setProperty('--dc-weekday-radius', theme.weekdayRadius);
    if (theme.dayColor) root.style.setProperty('--dc-day-color', theme.dayColor);
    if (theme.holidayBg) root.style.setProperty('--dc-holiday-bg', theme.holidayBg);
    if (theme.holidayColor) root.style.setProperty('--dc-holiday-color', theme.holidayColor);
    if (theme.todayBorder) root.style.setProperty('--dc-today-border', theme.todayBorder);
    if (theme.todayBorderWidth) root.style.setProperty('--dc-today-border-width', theme.todayBorderWidth);
    if (theme.navColor) root.style.setProperty('--dc-nav-color', theme.navColor);
    if (theme.navHover) root.style.setProperty('--dc-nav-hover', theme.navHover);
    if (theme.todayBtnBg) root.style.setProperty('--dc-today-btn-bg', theme.todayBtnBg);
    if (theme.todayBtnText) root.style.setProperty('--dc-today-btn-text', theme.todayBtnText);
    if (theme.todayBtnHover) root.style.setProperty('--dc-today-btn-hover', theme.todayBtnHover);
    if (theme.fontFamily) root.style.setProperty('--dc-font-family', theme.fontFamily);
  }

  /**
   * Get the currently selected date
   */
  public getDate(): Date {
    // Return the first day of the current month
    const firstDay = this.currentGrid.days.find((d) => d.isCurrentMonth);
    if (!firstDay) return new Date();
    return firstDay.gregorianDate;
  }

  /**
   * Go to a specific date
   */
  public goTo(date: Date | string): void {
    const parsedDate = parseDate(date);
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth() + 1;
    this.currentGrid = this.buildGrid(year, month);
    this.updateRender();
    this.options.onMonthChange?.(this.currentGrid);
  }

  /**
   * Go to today
   */
  public goToToday(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const holidayMaps = resolveHolidays(this.rawHolidays, year);
    const options: GridBuilderOptions = {
      weekendDays: this.options.weekendDays,
      holidayMaps,
      events: this.options.events,
      weekStart: 0,
    };
    this.currentGrid = buildCalendarGrid(year, month, options);
    this.updateRender();
    this.options.onMonthChange(this.currentGrid);
  }

  /**
   * Go to next month
   */
  public next(): void {
    let nextYear = this.currentGrid.year;
    let nextMonth = this.currentGrid.month + 1;

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }

    const holidayMaps = resolveHolidays(this.rawHolidays, nextYear);
    const options: GridBuilderOptions = {
      weekendDays: this.options.weekendDays,
      holidayMaps,
      events: this.options.events,
      weekStart: 0,
    };
    this.currentGrid = buildCalendarGrid(nextYear, nextMonth, options);
    this.updateRender();
    this.options.onMonthChange(this.currentGrid);
  }

  /**
   * Go to previous month
   */
  public prev(): void {
    let prevYear = this.currentGrid.year;
    let prevMonth = this.currentGrid.month - 1;

    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear--;
    }

    const holidayMaps = resolveHolidays(this.rawHolidays, prevYear);
    const options: GridBuilderOptions = {
      weekendDays: this.options.weekendDays,
      holidayMaps,
      events: this.options.events,
      weekStart: 0,
    };
    this.currentGrid = buildCalendarGrid(prevYear, prevMonth, options);
    this.updateRender();
    this.options.onMonthChange(this.currentGrid);
  }

  /**
   * Update the render without full re-render
   */
  private updateRender(): void {
    if (this.destroyed) return;

    updateHeader(this.container, this.currentGrid, this.options.locale);
    updateGrid(this.container, this.currentGrid, {
      locale: this.options.locale,
      onDayClick: (day) => {
        this.options.onDayClick?.(day.gregorianDate);
      },
    });
  }

  /**
   * Set holidays
   */
  public async setHolidays(holidays: HolidayEntry[] | string): Promise<void> {
    this.options.holidays = holidays;
    await this.initializeHolidays();

    // Rebuild current grid with new holidays
    this.currentGrid = this.buildGrid(this.currentGrid.year, this.currentGrid.month);
    this.updateRender();
  }

  /**
   * Set events
   */
  public setEvents(events: EventEntry[]): void {
    this.options.events = events;

    // Rebuild current grid with new events
    this.currentGrid = this.buildGrid(this.currentGrid.year, this.currentGrid.month);
    this.updateRender();
  }

  /**
   * Set theme
   */
  public setTheme(theme: DualCalTheme): void {
    this.options.theme = theme;
    this.applyTheme(theme);
  }

  /**
   * Destroy the calendar instance
   */
  public destroy(): void {
    this.destroyed = true;
    this.container.innerHTML = '';
  }
}

/**
 * Create a DualCalendar instance
 */
export function createDualCalendar(
  container: HTMLElement,
  options?: DualCalendarOptions,
): DualCalendar {
  return new DualCalendar(container, options);
}
