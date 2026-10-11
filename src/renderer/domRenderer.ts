/**
 * dualcal - DOM renderer for calendar grid
 */

import type { CalendarGrid, CalendarDay, GregorianDigits, HolidayEntry, JalaaliDate } from '../types';
import {
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS_SHORT,
  GREGORIAN_MONTHS_SHORT,
} from '../types';
import { toPersianDigits, getGregorianMonthName, getHijriMonthName, getHijriYear } from '../utils/dateUtils';

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
 * Create navigation arrow icon
 */
function createNavArrowIcon(reverse = false): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '17');
  svg.setAttribute('height', '13');
  svg.setAttribute('viewBox', '0 0 17 13');
  svg.setAttribute('fill', 'none');
  svg.style.marginLeft = '4px';

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M9.4721 12.7509C9.07913 12.5568 8.73935 12.2698 8.4821 11.9149C8.36647 11.7724 8.30337 11.5945 8.30337 11.4109C8.30337 11.2274 8.36647 11.0495 8.4821 10.9069C8.53195 10.8439 8.58572 10.7842 8.6431 10.7279L11.6851 7.70893C11.7251 7.67353 11.7668 7.64016 11.8101 7.60893V7.56993H1.6521C1.52232 7.58072 1.39176 7.56322 1.26941 7.51864C1.14706 7.47406 1.03584 7.40346 0.943424 7.31172C0.851013 7.21997 0.779611 7.10926 0.734148 6.98724C0.688685 6.86521 0.670243 6.73478 0.680096 6.60493C0.694364 6.43623 0.694364 6.26663 0.680096 6.09793C0.669898 5.97261 0.687144 5.84657 0.730633 5.72859C0.774123 5.61061 0.84281 5.50354 0.93191 5.41482C1.02101 5.3261 1.12838 5.25787 1.24654 5.21488C1.36471 5.1719 1.49082 5.15519 1.6161 5.16593C3.5271 5.18393 5.4421 5.16593 7.3571 5.16593H11.7771L11.6591 5.03393L8.6401 2.01793C8.53586 1.93708 8.45149 1.83346 8.39345 1.71499C8.33541 1.59652 8.30524 1.46635 8.30524 1.33443C8.30524 1.20251 8.33541 1.07234 8.39345 0.953871C8.45149 0.835404 8.53586 0.731781 8.6401 0.65093C8.7611 0.52593 8.8871 0.40093 8.9971 0.29393C9.07661 0.201702 9.17508 0.127704 9.28578 0.0769807C9.39648 0.0262569 9.51682 0 9.6386 0C9.76037 0 9.88071 0.0262569 9.99141 0.0769807C10.1021 0.127704 10.2006 0.201702 10.2801 0.29393L11.9991 2.00893L15.5501 5.55993C15.7634 5.72739 15.9326 5.94432 16.0431 6.19193V6.55093C16.0132 6.74733 15.9112 6.92556 15.7571 7.05093C13.9444 8.85093 12.1341 10.6553 10.3261 12.4639C10.1973 12.618 10.0173 12.7206 9.8191 12.7529L9.4721 12.7509Z');
  path.setAttribute('fill', '#AD3D00');

  if (reverse) {
    svg.style.transform = 'scaleX(-1)';
  }

  svg.appendChild(path);
  return svg;
}

/**
 * Update header content when month/year changes
 */
export function updateHeader(container: HTMLElement, grid: CalendarGrid): void {
  const header = container.querySelector('.dualcal-header');
  if (!header) return;

  // Update title
  const title = header.querySelector('.dualcal-title');
  if (title) {
    title.textContent = `${PERSIAN_MONTHS[grid.month - 1]} ${toPersianDigits(String(grid.year))}`;
  }

  // Update Gregorian range
  const range = header.querySelector('.dualcal-range');
  if (range) {
    const firstDay = grid.days[0];
    const lastDay = grid.days[grid.days.length - 1];
    const startMonth = getGregorianMonthName(firstDay.gregorianDate.getMonth(), false);
    const endMonth = getGregorianMonthName(lastDay.gregorianDate.getMonth(), false);
    const year = lastDay.gregorianDate.getFullYear();
    range.textContent = `${startMonth} - ${endMonth} ${year}`;
  }

  // Update Hijri row
  const hijriRow = header.querySelector('.dualcal-hijri-row');
  if (hijriRow) {
    const hijriMonth1 = getHijriMonthName(grid.days[0].gregorianDate);
    const hijriMonth2 = getHijriMonthName(grid.days[grid.days.length - 1].gregorianDate);
    const hijriYear = getHijriYear(grid.days[0].gregorianDate);
    hijriRow.textContent = `${hijriMonth1} - ${hijriMonth2} ${hijriYear}`;
  }

  // Update popover if open
  const popover = header.querySelector('.dualcal-popover');
  if (popover) {
    // Remove old popover and create new one with updated content
    popover.remove();
    const newPopover = createHolidaysPopover(grid);
    header.appendChild(newPopover);
    requestAnimationFrame(() => {
      newPopover.classList.add('visible');
    });
  }
}

/**
 * Render the complete calendar widget
 */
export function renderCalendar(
  container: HTMLElement,
  grid: CalendarGrid,
  options: {
    gregorianDigits: GregorianDigits;
    monthListMode?: 'popover' | 'inline';
    onDayClick?: (day: CalendarDay) => void;
    onMonthChange?: (jy: number, jm: number) => void;
    onYearChange?: (jy: number) => void;
    onNextMonth?: () => void;
    onPrevMonth?: () => void;
    onGoToToday?: () => void;
  },
): void {
  // Clear container
  container.innerHTML = '';

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
    onMonthChange: options.onMonthChange,
    onNextMonth: options.onNextMonth,
    onPrevMonth: options.onPrevMonth,
  });

  // Render weekday row
  renderWeekdays(inner);

  // Render grid
  renderGrid(inner, grid, options);

  // Render go to today button
  renderTodayButton(inner, options);

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
    onMonthChange?: (jy: number, jm: number) => void;
    onYearChange?: (jy: number) => void;
    onNextMonth?: () => void;
    onPrevMonth?: () => void;
  },
): void {
  const header = document.createElement('div');
  header.className = 'dualcal-header';

  // Info button container (top-left in RTL)
  if (options.monthListMode !== 'inline') {
    const infoContainer = document.createElement('div');
    infoContainer.className = 'dualcal-info';
    infoContainer.style.position = 'absolute';
    infoContainer.style.top = '0';
    infoContainer.style.left = '0';

    const infoBtn = document.createElement('button');
    infoBtn.className = 'dualcal-info-btn';
    infoBtn.setAttribute('type', 'button');
    infoBtn.setAttribute('aria-label', 'مناسبت‌های این ماه');
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

      const popover = createHolidaysPopover(grid);
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
  yearPicker.setAttribute('aria-label', 'انتخاب سال');
  yearPicker.appendChild(createChevronIcon());
  yearPicker.addEventListener('click', (e) => {
    e.stopPropagation();
    const existingDropdown = document.querySelector('.dualcal-year-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
      return;
    }

    const dropdown = createYearDropdown(grid.year, (newYear) => {
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
  title.textContent = `${PERSIAN_MONTHS[grid.month - 1]} ${toPersianDigits(String(grid.year))}`;
  titleRow.appendChild(title);

  const monthPicker = document.createElement('button');
  monthPicker.className = 'dualcal-pick dualcal-pick-month';
  monthPicker.setAttribute('aria-label', 'انتخاب ماه');
  monthPicker.appendChild(createChevronIcon());
  monthPicker.addEventListener('click', (e) => {
    e.stopPropagation();
    const existingDropdown = document.querySelector('.dualcal-month-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
      return;
    }

    const dropdown = createMonthDropdown(grid.month, (newMonth) => {
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
  prevBtn.appendChild(document.createTextNode('ماه قبل'));
  prevBtn.appendChild(createNavArrowIcon(false));
  prevBtn.addEventListener('click', () => options.onPrevMonth?.());
  subRow.appendChild(prevBtn);

  const firstDay = grid.days[0];
  const lastDay = grid.days[grid.days.length - 1];
  const startMonth = getGregorianMonthName(firstDay.gregorianDate.getMonth(), false);
  const endMonth = getGregorianMonthName(lastDay.gregorianDate.getMonth(), false);
  const year = lastDay.gregorianDate.getFullYear();

  const range = document.createElement('div');
  range.className = 'dualcal-range';
  range.textContent = `${startMonth} - ${endMonth} ${year}`;
  subRow.appendChild(range);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'dualcal-nav dualcal-next';
  nextBtn.appendChild(document.createTextNode('ماه بعد'));
  nextBtn.appendChild(createNavArrowIcon(true));
  nextBtn.addEventListener('click', () => options.onNextMonth?.());
  subRow.appendChild(nextBtn);

  header.appendChild(subRow);

  // Hijri row (optional)
  const hijriRow = document.createElement('div');
  hijriRow.className = 'dualcal-hijri-row';
  const hijriMonth1 = getHijriMonthName(grid.days[0].gregorianDate);
  const hijriMonth2 = getHijriMonthName(grid.days[grid.days.length - 1].gregorianDate);
  const hijriYear = getHijriYear(grid.days[0].gregorianDate);
  hijriRow.textContent = `${hijriMonth1} - ${hijriMonth2} ${hijriYear}`;
  header.appendChild(hijriRow);

  container.appendChild(header);
}

/**
 * Render weekday header row
 */
function renderWeekdays(container: HTMLElement): void {
  const weekdays = document.createElement('div');
  weekdays.className = 'dualcal-weekdays';

  PERSIAN_WEEKDAYS_SHORT.forEach((day) => {
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
    gregorianDigits: GregorianDigits;
    onDayClick?: (day: CalendarDay) => void;
  },
): void {
  const gridEl = document.createElement('div');
  gridEl.className = 'dualcal-grid';
  gridEl.setAttribute('role', 'grid');

  grid.days.forEach((day, index) => {
    const dayCell = renderDayCell(day, index, options);
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
  options: {
    gregorianDigits: GregorianDigits;
    onDayClick?: (day: CalendarDay) => void;
  },
): HTMLElement {
  const cell = document.createElement('div');
  cell.className = 'dualcal-day';
  cell.setAttribute('role', 'gridcell');
  cell.setAttribute('tabindex', '0');
  cell.setAttribute('data-index', String(index));

  // Build aria-label (support multiple holidays)
  const jalaliStr = `${day.jalaliDate.jy}/${day.jalaliDate.jm}/${day.jalaliDate.jd}`;
  let holidayLabels: string[] = [];
  if (day.holidays && day.holidays.length > 0) {
    holidayLabels = day.holidays.map(h => h.title);
  }
  const holidayLabel = holidayLabels.length > 0 ? ` - ${holidayLabels.join(', ')}` : '';
  const ariaLabel = `${jalaliStr}${holidayLabel}`;
  cell.setAttribute('aria-label', ariaLabel);

  // Add classes
  if (!day.isCurrentMonth) {
    cell.classList.add('out-of-month');
  }
  if (day.isWeekend) {
    cell.classList.add('friday');
  }
  // Cell is a holiday if ANY entry has holiday=true OR it's a weekend
  if (day.isHoliday) {
    cell.classList.add('holiday');
  }
  if (day.isToday) {
    cell.classList.add('today');
  }

  // Jalali number (large, on top)
  const jalali = document.createElement('div');
  jalali.className = 'dualcal-jalali';
  jalali.textContent = toPersianDigits(String(day.jalaliDate.jd));
  cell.appendChild(jalali);

  // Gregorian and Hijri numbers (small, below)
  const subDates = document.createElement('div');
  subDates.className = 'dualcal-sub-dates';

  const gregorian = document.createElement('span');
  gregorian.className = 'dualcal-gregorian';
  const gregorianDay = day.gregorianDate.getDate();
  gregorian.textContent =
    options.gregorianDigits === 'persian'
      ? toPersianDigits(String(gregorianDay))
      : String(gregorianDay);
  subDates.appendChild(gregorian);

  if (day.hijriDate) {
    const hijri = document.createElement('span');
    hijri.className = 'dualcal-hijri';
    hijri.textContent = day.hijriDate;
    subDates.appendChild(hijri);
  }

  cell.appendChild(subDates);

  // Month name labels
  if (day.isJalaliFirst) {
    const monthLabel = document.createElement('div');
    monthLabel.className = 'dualcal-month-label';
    monthLabel.textContent = PERSIAN_MONTHS[day.jalaliDate.jm - 1];
    cell.appendChild(monthLabel);
  }

  if (day.isGregorianFirst) {
    const monthLabel = document.createElement('div');
    monthLabel.className = 'dualcal-month-label';
    monthLabel.textContent = GREGORIAN_MONTHS_SHORT[day.gregorianDate.getMonth()];
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
  options: {
    onGoToToday?: () => void;
  },
): void {
  const button = document.createElement('button');
  button.className = 'dualcal-today-btn';
  button.textContent = 'برو به امروز';
  button.setAttribute('type', 'button');
  button.addEventListener('click', () => options.onGoToToday?.());
  container.appendChild(button);
}

/**
 * Create holidays popover with grouped entries
 */
function createHolidaysPopover(grid: CalendarGrid): HTMLElement {
  const popover = document.createElement('div');
  popover.className = 'dualcal-popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'مناسبت‌های این ماه');

  // Filter holidays in current month
  const currentMonthHolidays: Array<{ date: JalaaliDate; holiday: HolidayEntry }> = [];

  grid.days
    .filter((day) => day.isCurrentMonth && day.holidays && day.holidays.length > 0)
    .forEach((day) => {
      if (day.holidays) {
        day.holidays.forEach((holiday) => {
          currentMonthHolidays.push({
            date: day.jalaliDate,
            holiday,
          });
        });
      }
    });

  // Sort by date
  currentMonthHolidays.sort((a, b) => {
    if (a.date.jm !== b.date.jm) return a.date.jm - b.date.jm;
    return a.date.jd - b.date.jd;
  });

  // Empty state
  if (currentMonthHolidays.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'dualcal-popover-empty';
    emptyState.textContent = 'مناسبتی برای این ماه ثبت نشده است';
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
        dateSpan.style.color = 'var(--dc-holiday-jalali-color)';
      }
      const persianMonthName = PERSIAN_MONTHS[date.jm - 1];
      dateSpan.textContent = `${toPersianDigits(String(date.jd))} ${persianMonthName}`;
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
  renderGroup(holidays, 'تعطیلات', true);
  renderGroup(religious, 'مذهبی', false);
  renderGroup(national, 'ملی و باستانی', false);
  renderGroup(international, 'جهانی', false);
  renderGroup(historical, 'تاریخی', false);
  renderGroup(personal, 'شخصی', false);

  return popover;
}

/**
 * Update the grid without re-rendering the entire widget
 */
export function updateGrid(
  container: HTMLElement,
  grid: CalendarGrid,
  options: {
    gregorianDigits: GregorianDigits;
    onDayClick?: (day: CalendarDay) => void;
  },
): void {
  const gridEl = container.querySelector('.dualcal-grid');
  if (!gridEl) {
    // If grid doesn't exist, do full re-render
    renderCalendar(container, grid, options);
    return;
  }

  // Clear existing grid
  gridEl.innerHTML = '';

  // Re-render grid
  grid.days.forEach((day, index) => {
    const dayCell = renderDayCell(day, index, options);
    gridEl.appendChild(dayCell);
  });

  // Update header
  const monthName = container.querySelector('.dualcal-month-name');
  if (monthName) {
    monthName.textContent = PERSIAN_MONTHS[grid.month - 1];
  }

  const yearName = container.querySelector('.dualcal-year');
  if (yearName) {
    yearName.textContent = toPersianDigits(String(grid.year));
  }

  // Update subheader
  const gregorianRange = container.querySelector('.dualcal-gregorian-range');
  if (gregorianRange) {
    const firstDay = grid.days[0];
    const lastDay = grid.days[grid.days.length - 1];
    const startMonth = getGregorianMonthName(firstDay.gregorianDate.getMonth(), false);
    const endMonth = getGregorianMonthName(lastDay.gregorianDate.getMonth(), false);
    const year = lastDay.gregorianDate.getFullYear();
    gregorianRange.textContent = `${startMonth} - ${endMonth} ${year}`;
  }
}

/**
 * Create year selector dropdown
 */
function createYearDropdown(
  currentYear: number,
  onSelect: (year: number) => void,
): HTMLElement {
  const dropdown = document.createElement('div');
  dropdown.className = 'dualcal-year-dropdown';

  const title = document.createElement('h6');
  title.className = 'dualcal-dropdown-title';
  title.textContent = 'سال مورد نظر خود را وارد نمایید';
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
      if (!isNaN(year) && year >= 1300 && year <= 1500) {
        onSelect(year);
      }
    }
  });
  
  inputContainer.appendChild(input);

  const adornment = document.createElement('span');
  adornment.className = 'dualcal-year-adornment';
  adornment.textContent = 'به سال';
  inputContainer.appendChild(adornment);

  const button = document.createElement('button');
  button.className = 'dualcal-year-button';
  button.textContent = 'برو';
  button.setAttribute('type', 'button');
  button.addEventListener('click', () => {
    const year = parseInt(input.value, 10);
    if (!isNaN(year) && year >= 1300 && year <= 1500) {
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
  onSelect: (month: number) => void,
): HTMLElement {
  const dropdown = document.createElement('div');
  dropdown.className = 'dualcal-month-dropdown';

  const title = document.createElement('h6');
  title.className = 'dualcal-dropdown-title';
  title.textContent = 'ماه مورد نظر خود را انتخاب کنید';
  dropdown.appendChild(title);

  const monthList = document.createElement('div');
  monthList.className = 'dualcal-month-list';

  PERSIAN_MONTHS.forEach((monthName, index) => {
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
    label.textContent = `${month}. ${monthName}`;

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
