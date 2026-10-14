/**
 * CalendarDate - DOM renderer for calendar grid (Gregorian only)
 */

import type { CalendarGrid, CalendarDay, HolidayEntry, Locale } from '../types';
import { getTranslations, getMonthName, getWeekdayName } from '../i18n/translations';

/**
 * Create SVG chevron icon
 */
function createChevronIcon(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z');
  path.setAttribute('fill', 'currentColor');

  svg.appendChild(path);
  return svg;
}

/**
 * Create info "i" icon
 */
function createInfoIcon(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '10');
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', 'currentColor');
  circle.setAttribute('stroke-width', '2');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 16V12');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');

  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('cx', '12');
  dot.setAttribute('cy', '8');
  dot.setAttribute('r', '1');
  dot.setAttribute('fill', 'currentColor');

  svg.appendChild(circle);
  svg.appendChild(path);
  svg.appendChild(dot);
  return svg;
}

/**
 * Update header content when month/year changes
 */
export function updateHeader(container: HTMLElement, grid: CalendarGrid, locale: Locale = 'en'): void {
  const header = container.querySelector('.dualcal-header');
  if (!header) return;

  const t = getTranslations(locale);

  // Update title
  const title = header.querySelector('.dualcal-title');
  if (title) {
    title.textContent = `${getMonthName(grid.month - 1, locale, false)} ${grid.year}`;
  }

  // Update range text
  const range = header.querySelector('.dualcal-range');
  if (range) {
    range.textContent = `${getMonthName(grid.month - 1, locale, false)} ${grid.year}`;
  }

  // Update popover if open
  const popover = header.querySelector('.dualcal-popover');
  const infoBtn = header.querySelector('.dualcal-info-btn');
  if (popover && infoBtn) {
    // Store the visible state
    const wasVisible = popover.classList.contains('visible');
    // Remove old popover and create new one with updated content
    popover.remove();
    const newPopover = createHolidaysPopover(grid, locale);
    header.appendChild(newPopover);
    // Restore visibility if it was open
    if (wasVisible) {
      requestAnimationFrame(() => {
        newPopover.classList.add('visible');
        infoBtn.setAttribute('aria-expanded', 'true');
      });
    }
  }
}

/**
 * Render the complete calendar widget
 */
export function renderCalendar(
  container: HTMLElement,
  grid: CalendarGrid,
  options: {
    monthListMode?: 'popover' | 'inline';
    locale?: Locale;
    onDayClick?: (day: CalendarDay) => void;
    onMonthChange?: (year: number, month: number) => void;
    onNextMonth?: () => void;
    onPrevMonth?: () => void;
    onGoToToday?: () => void;
  },
): void {
  // Clear container
  container.innerHTML = '';

  const locale = options.locale || 'en';
  const t = getTranslations(locale);

  // Create outer card
  const outer = document.createElement('div');
  outer.className = 'dualcal-outer';

  // Add binder rings
  const leftRing = document.createElement('div');
  leftRing.className = 'dualcal-ring';
  leftRing.setAttribute('aria-hidden', 'true');
  outer.appendChild(leftRing);

  const rightRing = document.createElement('div');
  rightRing.className = 'dualcal-ring';
  rightRing.setAttribute('aria-hidden', 'true');
  outer.appendChild(rightRing);

  // Create inner card
  const inner = document.createElement('div');
  inner.className = 'dualcal-inner';
  outer.appendChild(inner);

  // Render header
  renderHeader(inner, grid, {
    monthListMode: options.monthListMode,
    locale,
    onMonthChange: options.onMonthChange,
    onNextMonth: options.onNextMonth,
    onPrevMonth: options.onPrevMonth,
  });

  // Render weekday row
  renderWeekdays(inner, locale);

  // Render grid
  renderGrid(inner, grid, options);

  // Render go to today button
  renderTodayButton(inner, locale, options);

  container.appendChild(outer);
}

// Export for testing
export { createInfoIcon, createHolidaysPopover };

/**
 * Render header section
 */
function renderHeader(
  container: HTMLElement,
  grid: CalendarGrid,
  options: {
    monthListMode?: 'popover' | 'inline';
    locale?: Locale;
    onMonthChange?: (year: number, month: number) => void;
    onNextMonth?: () => void;
    onPrevMonth?: () => void;
  },
): void {
  const header = document.createElement('div');
  header.className = 'dualcal-header';

  const locale = options.locale || 'en';
  const t = getTranslations(locale);

  // Info button container (top-left in LTR)
  if (options.monthListMode !== 'inline') {
    const infoContainer = document.createElement('div');
    infoContainer.className = 'dualcal-info';
    infoContainer.style.position = 'absolute';
    infoContainer.style.top = '0';
    infoContainer.style.left = '0';

    const infoBtn = document.createElement('button');
    infoBtn.className = 'dualcal-info-btn';
    infoBtn.setAttribute('type', 'button');
    infoBtn.setAttribute('aria-label', t.ui.holidaysThisMonth);
    infoBtn.setAttribute('aria-haspopup', 'dialog');
    infoBtn.setAttribute('aria-expanded', 'false');
    infoBtn.appendChild(createInfoIcon());

    infoBtn.addEventListener('click', () => {
      const isExpanded = infoBtn.getAttribute('aria-expanded') === 'true';
      infoBtn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');

      const existingPopover = header.querySelector('.dualcal-popover');
      if (existingPopover) {
        existingPopover.remove();
        return;
      }

      const popover = createHolidaysPopover(grid, locale);
      // Append to header instead of infoContainer for full width
      header.appendChild(popover);

      // Add visible class after a small delay for animation
      requestAnimationFrame(() => {
        popover.classList.add('visible');
      });

      // Focus popover
      popover.setAttribute('tabindex', '-1');
      popover.focus();

      // Click outside to close
      const closeOnOutside = (e: MouseEvent) => {
        if (!header.contains(e.target as Node)) {
          popover.remove();
          infoBtn.setAttribute('aria-expanded', 'false');
          document.removeEventListener('pointerdown', closeOnOutside);
        }
      };
      setTimeout(() => {
        document.addEventListener('pointerdown', closeOnOutside);
      }, 0);

      // Escape to close
      const closeOnEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          popover.remove();
          infoBtn.setAttribute('aria-expanded', 'false');
          infoBtn.focus();
          document.removeEventListener('keydown', closeOnEscape);
        }
      };
      document.addEventListener('keydown', closeOnEscape);
    });

    infoContainer.appendChild(infoBtn);
    header.appendChild(infoContainer);
  }

  // Title row: year picker, title, month picker
  const titleRow = document.createElement('div');
  titleRow.className = 'dualcal-title-row';

  const yearPicker = document.createElement('button');
  yearPicker.className = 'dualcal-pick dualcal-pick-year';
  yearPicker.setAttribute('aria-label', t.ui.selectYear);
  yearPicker.appendChild(createChevronIcon());
  yearPicker.addEventListener('click', (e) => {
    e.stopPropagation();
    const existingDropdown = document.querySelector('.dualcal-year-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
      return;
    }

    const dropdown = createYearDropdown(grid.year, locale, (newYear) => {
      options.onMonthChange?.(newYear, grid.month);
      dropdown.remove();
    });

    const header = container.querySelector('.dualcal-header');
    if (header) {
      (header as HTMLElement).style.position = 'relative';
      header.appendChild(dropdown);
    }

    const closeDropdown = (e: MouseEvent) => {
      if (!dropdown.contains(e.target as Node) && !yearPicker.contains(e.target as Node)) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
    }, 0);
  });
  titleRow.appendChild(yearPicker);

  const title = document.createElement('span');
  title.className = 'dualcal-title';
  title.textContent = `${getMonthName(grid.month - 1, locale, false)} ${grid.year}`;
  titleRow.appendChild(title);

  const monthPicker = document.createElement('button');
  monthPicker.className = 'dualcal-pick dualcal-pick-month';
  monthPicker.setAttribute('aria-label', t.ui.selectMonth);
  monthPicker.appendChild(createChevronIcon());
  monthPicker.addEventListener('click', (e) => {
    e.stopPropagation();
    const existingDropdown = document.querySelector('.dualcal-month-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
      return;
    }

    const dropdown = createMonthDropdown(grid.month, locale, (newMonth) => {
      options.onMonthChange?.(grid.year, newMonth);
      dropdown.remove();
    });

    const header = container.querySelector('.dualcal-header');
    if (header) {
      (header as HTMLElement).style.position = 'relative';
      header.appendChild(dropdown);
    }

    const closeDropdown = (e: MouseEvent) => {
      if (!dropdown.contains(e.target as Node) && !monthPicker.contains(e.target as Node)) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
    }, 0);
  });
  titleRow.appendChild(monthPicker);

  header.appendChild(titleRow);

  // Sub row: prev button, gregorian range, next button
  const subRow = document.createElement('div');
  subRow.className = 'dualcal-sub-row';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'dualcal-nav dualcal-prev';
  prevBtn.appendChild(createChevronIcon());
  prevBtn.appendChild(document.createTextNode(t.ui.previous));
  prevBtn.addEventListener('click', () => options.onPrevMonth?.());
  subRow.appendChild(prevBtn);

  const range = document.createElement('div');
  range.className = 'dualcal-range';
  range.textContent = `${getMonthName(grid.month - 1, locale, false)} ${grid.year}`;
  subRow.appendChild(range);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'dualcal-nav dualcal-next';
  nextBtn.appendChild(document.createTextNode(t.ui.next));
  nextBtn.appendChild(createChevronIcon());
  nextBtn.addEventListener('click', () => options.onNextMonth?.());
  subRow.appendChild(nextBtn);

  header.appendChild(subRow);

  container.appendChild(header);
}

/**
 * Render weekday header row
 */
function renderWeekdays(container: HTMLElement, locale: Locale = 'en'): void {
  const weekdays = document.createElement('div');
  weekdays.className = 'dualcal-weekdays';

  const t = getTranslations(locale);
  t.weekdays.short.forEach((day) => {
    const weekday = document.createElement('div');
    weekday.className = 'dualcal-weekday';
    weekday.textContent = day;
    weekdays.appendChild(weekday);
  });

  container.appendChild(weekdays);
}

/**
 * Render calendar grid
 */
function renderGrid(
  container: HTMLElement,
  grid: CalendarGrid,
  options: {
    locale?: Locale;
    onDayClick?: (day: CalendarDay) => void;
  },
): void {
  const gridEl = document.createElement('div');
  gridEl.className = 'dualcal-grid';
  gridEl.setAttribute('role', 'grid');

  const locale = options.locale || 'en';

  grid.days.forEach((day, index) => {
    const dayCell = renderDayCell(day, index, locale, options);
    gridEl.appendChild(dayCell);
  });

  container.appendChild(gridEl);
}

/**
 * Render a single day cell
 */
function renderDayCell(
  day: CalendarDay,
  index: number,
  locale: Locale = 'en',
  options: {
    onDayClick?: (day: CalendarDay) => void;
  },
): HTMLElement {
  const cell = document.createElement('div');
  cell.className = 'dualcal-day';
  cell.setAttribute('role', 'gridcell');
  cell.setAttribute('tabindex', '0');
  cell.setAttribute('data-index', String(index));

  // Build aria-label (support multiple holidays)
  const dateStr = day.gregorianIso;
  let holidayLabels: string[] = [];
  if (day.holidays && day.holidays.length > 0) {
    holidayLabels = day.holidays.map(h => h.title);
  }
  const holidayLabel = holidayLabels.length > 0 ? ` - ${holidayLabels.join(', ')}` : '';
  const ariaLabel = `${dateStr}${holidayLabel}`;
  cell.setAttribute('aria-label', ariaLabel);

  // Add classes
  if (!day.isCurrentMonth) {
    cell.classList.add('out-of-month');
  }
  if (day.isWeekend) {
    cell.classList.add('weekend');
  }
  // Cell is a holiday if ANY entry has holiday=true OR it's a weekend
  if (day.isHoliday) {
    cell.classList.add('holiday');
  }
  if (day.isToday) {
    cell.classList.add('today');
  }

  // Day number (large, on top)
  const dayNumber = document.createElement('div');
  dayNumber.className = 'dualcal-day-number';
  dayNumber.textContent = String(day.gregorianDate.getDate());
  cell.appendChild(dayNumber);

  // Month name label (on 1st of month)
  if (day.isFirstOfMonth) {
    const monthLabel = document.createElement('div');
    monthLabel.className = 'dualcal-month-label';
    monthLabel.textContent = getMonthName(day.gregorianDate.getMonth(), locale, true);
    cell.appendChild(monthLabel);
  }

  // Event dots
  if (day.events.length > 0) {
    const events = document.createElement('div');
    events.className = 'dualcal-events';

    day.events.forEach((event) => {
      const dot = document.createElement('div');
      dot.className = 'dualcal-event-dot';
      if (event.color) {
        dot.style.backgroundColor = event.color;
      }
      events.appendChild(dot);
    });

    cell.appendChild(events);
  }

  // Type-based dots for non-holiday entries
  if (day.holidays && day.holidays.length > 0) {
    const nonHolidayEntries = day.holidays.filter(h => !h.holiday);
    if (nonHolidayEntries.length > 0) {
      const typeDots = document.createElement('div');
      typeDots.className = 'dualcal-events';

      nonHolidayEntries.forEach((entry) => {
        const dot = document.createElement('div');
        dot.className = 'dualcal-event-dot';
        // Color by type
        const typeColors: Record<string, string> = {
          official: '#AD3D00',
          religious: '#8B4513',
          national: '#2E7D32',
          international: '#1565C0',
          historical: '#6B21A8',
          personal: '#E91E63',
        };
        dot.style.backgroundColor = typeColors[entry.type || 'personal'] || '#999999';
        typeDots.appendChild(dot);
      });

      cell.appendChild(typeDots);
    }
  }

  // Click handler
  cell.addEventListener('click', () => options.onDayClick?.(day));

  // Keyboard navigation
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      options.onDayClick?.(day);
    }
  });

  return cell;
}

/**
 * Render go to today button
 */
function renderTodayButton(
  container: HTMLElement,
  locale: Locale = 'en',
  options: {
    onGoToToday?: () => void;
  },
): void {
  const t = getTranslations(locale);
  const button = document.createElement('button');
  button.className = 'dualcal-today-btn';
  button.textContent = t.ui.today;
  button.setAttribute('type', 'button');
  button.addEventListener('click', () => options.onGoToToday?.());
  container.appendChild(button);
}

/**
 * Create holidays popover with grouped entries
 */
function createHolidaysPopover(grid: CalendarGrid, locale: Locale = 'en'): HTMLElement {
  const popover = document.createElement('div');
  popover.className = 'dualcal-popover';
  popover.setAttribute('role', 'dialog');

  const t = getTranslations(locale);
  popover.setAttribute('aria-label', t.ui.holidaysThisMonth);

  // Filter holidays in current month
  const currentMonthHolidays: Array<{ date: string; holiday: HolidayEntry }> = [];

  grid.days
    .filter((day) => day.isCurrentMonth && day.holidays && day.holidays.length > 0)
    .forEach((day) => {
      if (day.holidays) {
        day.holidays.forEach((holiday) => {
          currentMonthHolidays.push({
            date: day.gregorianIso,
            holiday,
          });
        });
      }
    });

  // Sort by date
  currentMonthHolidays.sort((a, b) => a.date.localeCompare(b.date));

  // Empty state
  if (currentMonthHolidays.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'dualcal-popover-empty';
    emptyState.textContent = t.ui.noHolidaysThisMonth;
    popover.appendChild(emptyState);
    return popover;
  }

  // Group by type
  const holidays = currentMonthHolidays.filter(h => h.holiday.holiday === true);
  const religious = currentMonthHolidays.filter(h => h.holiday.type === 'religious' && !h.holiday.holiday);
  const national = currentMonthHolidays.filter(h => h.holiday.type === 'national' && !h.holiday.holiday);
  const international = currentMonthHolidays.filter(h => h.holiday.type === 'international' && !h.holiday.holiday);
  const historical = currentMonthHolidays.filter(h => h.holiday.type === 'historical' && !h.holiday.holiday);
  const personal = currentMonthHolidays.filter(h => h.holiday.type === 'personal' && !h.holiday.holiday);

  // Helper to render group
  const renderGroup = (items: typeof currentMonthHolidays, heading: string, isHolidayGroup: boolean) => {
    if (items.length === 0) return;

    const group = document.createElement('div');
    group.className = 'dualcal-popover-group';

    const groupHeading = document.createElement('div');
    groupHeading.className = 'dualcal-popover-group-heading';
    groupHeading.setAttribute('role', 'heading');
    groupHeading.textContent = heading;
    group.appendChild(groupHeading);

    const list = document.createElement('ul');
    list.className = 'dualcal-popover-list';

    items.forEach(({ date, holiday }) => {
      const li = document.createElement('li');
      li.className = 'dualcal-popover-item';

      const dateSpan = document.createElement('span');
      dateSpan.className = 'dualcal-popover-date';
      if (isHolidayGroup) {
        dateSpan.style.color = 'var(--dc-holiday-color)';
      }
      dateSpan.textContent = date;
      li.appendChild(dateSpan);

      const titleSpan = document.createElement('span');
      titleSpan.className = 'dualcal-popover-title';
      titleSpan.textContent = holiday.title;
      li.appendChild(titleSpan);

      list.appendChild(li);
    });

    group.appendChild(list);
    popover.appendChild(group);
  };

  // Render groups
  renderGroup(holidays, t.ui.holidays, true);
  renderGroup(religious, t.ui.religious, false);
  renderGroup(national, t.ui.national, false);
  renderGroup(international, t.ui.international, false);
  renderGroup(historical, t.ui.historical, false);
  renderGroup(personal, t.ui.personal, false);

  return popover;
}

/**
 * Update the grid without re-rendering the entire widget
 */
export function updateGrid(
  container: HTMLElement,
  grid: CalendarGrid,
  options: {
    locale?: Locale;
    onDayClick?: (day: CalendarDay) => void;
  },
): void {
  const gridEl = container.querySelector('.dualcal-grid');
  if (!gridEl) {
    // If grid doesn't exist, do full re-render
    renderCalendar(container, grid, options);
    return;
  }

  const locale = options.locale || 'en';

  // Clear existing grid
  gridEl.innerHTML = '';

  // Re-render grid
  grid.days.forEach((day, index) => {
    const dayCell = renderDayCell(day, index, locale, options);
    gridEl.appendChild(dayCell);
  });

  // Update header
  const monthName = container.querySelector('.dualcal-month-name');
  if (monthName) {
    monthName.textContent = getMonthName(grid.month - 1, locale, false);
  }

  const yearName = container.querySelector('.dualcal-year');
  if (yearName) {
    yearName.textContent = String(grid.year);
  }
}

/**
 * Create year selector dropdown
 */
function createYearDropdown(
  currentYear: number,
  locale: Locale = 'en',
  onSelect: (year: number) => void,
): HTMLElement {
  const dropdown = document.createElement('div');
  dropdown.className = 'dualcal-year-dropdown';

  const t = getTranslations(locale);

  const title = document.createElement('h6');
  title.className = 'dualcal-dropdown-title';
  title.textContent = t.ui.enterYear;
  dropdown.appendChild(title);

  const yearSelect = document.createElement('div');
  yearSelect.className = 'dualcal-year-select';

  const inputContainer = document.createElement('div');
  inputContainer.className = 'dualcal-year-input-wrapper';

  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.maxLength = 4;
  input.className = 'dualcal-year-input';
  input.value = String(currentYear);

  // Add ENTER key handler
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const year = parseInt(input.value, 10);
      if (!isNaN(year) && year >= 1900 && year <= 2100) {
        onSelect(year);
      }
    }
  });

  inputContainer.appendChild(input);

  const button = document.createElement('button');
  button.className = 'dualcal-year-button';
  button.textContent = t.ui.go;
  button.setAttribute('type', 'button');
  button.addEventListener('click', () => {
    const year = parseInt(input.value, 10);
    if (!isNaN(year) && year >= 1900 && year <= 2100) {
      onSelect(year);
    }
  });
  inputContainer.appendChild(button);

  yearSelect.appendChild(inputContainer);

  dropdown.appendChild(yearSelect);
  return dropdown;
}

/**
 * Create month selector dropdown
 */
function createMonthDropdown(
  currentMonth: number,
  locale: Locale = 'en',
  onSelect: (month: number) => void,
): HTMLElement {
  const dropdown = document.createElement('div');
  dropdown.className = 'dualcal-month-dropdown';

  const t = getTranslations(locale);

  const title = document.createElement('h6');
  title.className = 'dualcal-dropdown-title';
  title.textContent = t.ui.selectMonth;
  dropdown.appendChild(title);

  const monthList = document.createElement('div');
  monthList.className = 'dualcal-month-list';

  t.months.full.forEach((monthName, index) => {
    const month = index + 1;
    const item = document.createElement('div');
    item.className = 'dualcal-month-item';
    if (month === currentMonth) {
      item.classList.add('selected');
    }

    const radio = document.createElement('div');
    radio.className = 'dualcal-month-radio';
    if (month === currentMonth) {
      radio.classList.add('checked');
    }

    const label = document.createElement('span');
    label.textContent = monthName;

    item.appendChild(radio);
    item.appendChild(label);

    item.addEventListener('click', () => {
      onSelect(month);
    });

    monthList.appendChild(item);
  });

  dropdown.appendChild(monthList);
  return dropdown;
}
