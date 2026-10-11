/**
 * dualcal - Core DualCalendar class
 */

import type {
  DualCalendarOptions,
  CalendarGrid,
  HolidayEntry,
  EventEntry,
  DualCalTheme,
  HijriConfig,
} from './types';
import {
  parseDate,
  toJalaaliDate,
  toJalaali,
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
    jalaliMap: Map<string, HolidayEntry[]>;
    hijriMap: Map<string, HolidayEntry[]>;
    exactDateMap: Map<string, HolidayEntry[]>;
  };
  private hijriConfig: HijriConfig;
  private rawHolidays: HolidayEntry[];
  private destroyed = false;

  constructor(container: HTMLElement, options: DualCalendarOptions = {}) {
    this.container = container;
    this.holidayMaps = {
      jalaliMap: new Map(),
      hijriMap: new Map(),
      exactDateMap: new Map(),
    };
    this.hijriConfig = {};
    this.rawHolidays = [];

    // Merge with defaults
    this.options = {
      holidays: [],
      weekendDays: [6], // Friday (adjusted: Sunday=0 -> Saturday=0, Friday=6)
      initialDate: new Date(),
      events: [],
      showHijri: false,
      gregorianDigits: 'latin',
      monthListMode: 'popover',
      onDayClick: () => {},
      onMonthChange: () => {},
      theme: options.theme,
    };

    // Apply user options
    if (options.holidays !== undefined) this.options.holidays = options.holidays;
    if (options.weekendDays !== undefined) this.options.weekendDays = options.weekendDays;
    if (options.initialDate !== undefined) this.options.initialDate = options.initialDate;
    if (options.events !== undefined) this.options.events = options.events;
    if (options.showHijri !== undefined) this.options.showHijri = options.showHijri;
    if (options.gregorianDigits !== undefined) this.options.gregorianDigits = options.gregorianDigits;
    if (options.monthListMode !== undefined) this.options.monthListMode = options.monthListMode;
    if (options.onDayClick !== undefined) this.options.onDayClick = options.onDayClick;
    if (options.onMonthChange !== undefined) this.options.onMonthChange = options.onMonthChange;

    // Initialize holidays
    this.initializeHolidays().then(() => {
      // Build initial grid
      const initialDate = parseDate(this.options.initialDate);
      const jalali = toJalaaliDate(initialDate);
      this.currentGrid = this.buildGrid(jalali.jy, jalali.jm);

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

      // Extract Hijri config if present
      this.hijriConfig = schema.hijri || {};

      // Get current year for holiday resolution
      const today = new Date();
      const jalali = toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());

      // Resolve holidays for current year
      this.holidayMaps = resolveHolidays(schema.holidays, jalali.jy, this.hijriConfig);
    } catch (error) {
      console.error('[dualcal] Failed to initialize holidays:', error);
      this.holidayMaps = {
        jalaliMap: new Map(),
        hijriMap: new Map(),
        exactDateMap: new Map(),
      };
      this.rawHolidays = [];
      this.hijriConfig = {};
    }
  }

  /**
   * Build calendar grid for a given Jalaali month
   */
  private buildGrid(jy: number, jm: number): CalendarGrid {
    // Resolve holidays for the specific year
    this.holidayMaps = resolveHolidays(this.rawHolidays, jy, this.hijriConfig);

    const options: GridBuilderOptions = {
      weekendDays: this.options.weekendDays,
      holidayMaps: this.holidayMaps,
      hijriConfig: this.hijriConfig,
      events: this.options.events,
      showHijri: this.options.showHijri,
      weekStart: 0, // Saturday
    };
    return buildCalendarGrid(jy, jm, options);
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
      gregorianDigits: this.options.gregorianDigits,
      monthListMode: this.options.monthListMode,
      onDayClick: (day) => {
        this.options.onDayClick?.(day.gregorianDate, day.jalaliDate);
      },
      onMonthChange: (jy, jm) => {
        // Navigate to selected month
        this.currentGrid = this.buildGrid(jy, jm);
        this.updateRender();
        this.options.onMonthChange?.(this.currentGrid);
      },
      onYearChange: (newYear) => {
        // Navigate to selected year (same month)
        this.currentGrid = this.buildGrid(newYear, this.currentGrid.month);
        this.updateRender();
        this.options.onMonthChange?.(this.currentGrid);
      },
      onNextMonth: () => this.next(),
      onPrevMonth: () => this.prev(),
      onGoToToday: () => this.goToToday(),
    });

    // No tooltip listeners - tooltips removed
  }

  /**
   * Attach tooltip listeners to holiday cells - DEPRECATED, tooltips removed
   */
  /*
  private attachTooltipListeners(): void {
    const holidayCells = this.container.querySelectorAll('.dualcal-day');
    holidayCells.forEach((cell) => {
      const dayIndex = cell.getAttribute('data-index');
      if (dayIndex) {
        const day = this.currentGrid.days[parseInt(dayIndex, 10)];
        if (day && day.holidays && day.holidays.length > 0) {
          const holidayTitles = day.holidays.map(h => h.title).join(', ');
          cell.addEventListener('mouseenter', () => {
            showTooltip(cell as HTMLElement, holidayTitles);
          });
          cell.addEventListener('mouseleave', () => {
            hideTooltip();
          });
        }
      }
    });
  }
  */

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
    if (theme.dayJalaliColor) root.style.setProperty('--dc-day-jalali-color', theme.dayJalaliColor);
    if (theme.dayGregorianColor) root.style.setProperty('--dc-day-gregorian-color', theme.dayGregorianColor);
    if (theme.dayHijriColor) root.style.setProperty('--dc-day-hijri-color', theme.dayHijriColor);
    if (theme.holidayBg) root.style.setProperty('--dc-holiday-bg', theme.holidayBg);
    if (theme.holidayJalaliColor) root.style.setProperty('--dc-holiday-jalali-color', theme.holidayJalaliColor);
    if (theme.holidayGregorianColor) root.style.setProperty('--dc-holiday-gregorian-color', theme.holidayGregorianColor);
    if (theme.holidayHijriColor) root.style.setProperty('--dc-holiday-hijri-color', theme.holidayHijriColor);
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
    const jalali = toJalaaliDate(parsedDate);
    this.currentGrid = this.buildGrid(jalali.jy, jalali.jm);
    this.updateRender();
    this.options.onMonthChange?.(this.currentGrid);
  }

  /**
   * Go to today
   */
  public goToToday(): void {
    const today = new Date();
    const jalali = toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const holidayMaps = resolveHolidays(this.rawHolidays, jalali.jy, this.hijriConfig);
    const options: GridBuilderOptions = {
      weekendDays: this.options.weekendDays,
      holidayMaps,
      hijriConfig: this.hijriConfig,
      events: this.options.events,
      showHijri: this.options.showHijri,
      weekStart: 0,
    };
    this.currentGrid = buildCalendarGrid(jalali.jy, jalali.jm, options);
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

    const holidayMaps = resolveHolidays(this.rawHolidays, nextYear, this.hijriConfig);
    const options: GridBuilderOptions = {
      weekendDays: this.options.weekendDays,
      holidayMaps,
      hijriConfig: this.hijriConfig,
      events: this.options.events,
      showHijri: this.options.showHijri,
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

    const holidayMaps = resolveHolidays(this.rawHolidays, prevYear, this.hijriConfig);
    const options: GridBuilderOptions = {
      weekendDays: this.options.weekendDays,
      holidayMaps,
      hijriConfig: this.hijriConfig,
      events: this.options.events,
      showHijri: this.options.showHijri,
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

    updateHeader(this.container, this.currentGrid);
    updateGrid(this.container, this.currentGrid, {
      gregorianDigits: this.options.gregorianDigits,
      onDayClick: (day) => {
        this.options.onDayClick?.(day.gregorianDate, day.jalaliDate);
      },
    });

    // No tooltip listeners - tooltips removed
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
