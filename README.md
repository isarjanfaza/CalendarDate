# dualcal

Persian (Jalali) + Gregorian calendar widget - A framework-agnostic vanilla TypeScript library.

## Features

- 📅 Dual calendar display: Jalali (Persian) and Gregorian dates shown together in every cell
- 🎨 Beautiful desk-calendar design inspired by time.ir
- 🌙 Dark mode support via CSS variables and `prefers-color-scheme`
- ⌨️ Full keyboard navigation (arrows, Enter/Space, PageUp/PageDown)
- 🎯 Customizable themes with CSS variables
- 📋 Holiday support with validation and recurring events
- 🔔 Event dots for custom events
- 🌐 RTL layout by default
- 📱 Responsive design
- 🏗️ Framework-agnostic (works with vanilla JS, React, Vue, etc.)
- 🧪 Comprehensive test coverage
- 📦 Zero runtime dependencies (only peer dependency: `jalaali-js`)

## Installation

```bash
npm install dualcal jalaali-js
```

## Quick Start

```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="node_modules/dualcal/dist/dualcal.css">
</head>
<body>
  <div id="calendar"></div>

  <script type="module">
    import { createDualCalendar } from 'dualcal';

    const calendar = createDualCalendar(document.getElementById('calendar'), {
      holidays: [
        {
          date: '1405/07/20',
          calendar: 'jalali',
          title: 'تولد من',
          recurring: false,
          type: 'personal',
        },
      ],
      weekendDays: [5], // Friday
      showHijri: true,
      gregorianDigits: 'latin',
      onDayClick: (date, jalaliDate) => {
        console.log('Selected:', date, jalaliDate);
      },
    });
  </script>
</body>
</html>
```

## API

### `createDualCalendar(container, options?)`

Creates a new DualCalendar instance.

**Parameters:**

- `container: HTMLElement` - The DOM element to render the calendar into
- `options?: DualCalendarOptions` - Configuration options

**Returns:** `DualCalendarInstance`

### Options

```typescript
interface DualCalendarOptions {
  holidays?: HolidayEntry[] | string;  // Array or URL/JSON string
  weekendDays?: number[];               // Default: [5] (Friday)
  initialDate?: Date | string;          // Gregorian ISO or Jalali "1405/07/20"
  events?: EventEntry[];                // Custom events with dots
  theme?: Partial<DualCalTheme>;        // Custom theme colors
  showHijri?: boolean;                  // Default: false
  gregorianDigits?: 'latin' | 'persian'; // Default: 'latin'
  onDayClick?: (date: Date, jalaliDate: JalaaliDate) => void;
  onMonthChange?: (jalaliDate: JalaaliDate) => void;
}
```

### Instance Methods

```typescript
instance.getDate(): Date;              // Get current date
instance.goTo(date: Date | string);    // Go to specific date
instance.goToToday();                  // Go to today
instance.next();                       // Next month
instance.prev();                       // Previous month
instance.setHolidays(holidays);        // Update holidays
instance.setEvents(events);            // Update events
instance.setTheme(theme);              // Update theme
instance.destroy();                    // Clean up
```

## Holiday Schema

```json
{
  "holidays": [
    {
      "date": "1405/07/20",
      "calendar": "jalali",
      "title": "تولد من",
      "recurring": false,
      "type": "personal",
      "description": "Optional description"
    },
    {
      "date": "07/20",
      "calendar": "jalali",
      "title": "تولد من (سالانه)",
      "recurring": true,
      "type": "personal"
    },
    {
      "date": "2026-12-25",
      "calendar": "gregorian",
      "title": "Christmas",
      "recurring": false,
      "type": "international"
    },
    {
      "date": "01/10",
      "calendar": "hijri",
      "title": "عید سعید فطر",
      "recurring": true,
      "type": "religious",
      "isHoliday": 1
    }
  ],
  "hijri": {
    "offset": 0,
    "overrides": [
      {
        "hijri": "01/10",
        "date": "1405/12/05"
      }
    ]
  },
  "weekends": [5],
  "weekStart": 6
}
```

### Hijri (Lunar) Holiday Support

Hijri holidays are defined with `"calendar": "hijri"` and use `"date": "MM/DD"` format (Hijri month/day). These are always recurring and are matched against each visible Gregorian day using the browser's `Intl.DateTimeFormat` with the `islamic-umalqura` calendar.

**Important:** Iran's official lunar dates depend on moon sighting each year. The `Intl` Islamic calendar implementation may differ by 1-2 days from the official Iranian calendar. You should verify lunar dates annually and use the `offset` and `overrides` configuration to align with official sources.

- `hijri.offset`: Day offset to apply to Hijri calculations (e.g., `+1` to shift all Hijri holidays forward by one day)
- `hijri.overrides`: Array of overrides to pin specific Hijri holidays to exact dates for a year. Overrides use the format `{ "hijri": "MM/DD", "date": "YYYY/MM/DD" }` where `date` can be either Jalali or Gregorian ISO format. Overrides suppress the computed Hijri match for that year.

## Theme Customization

All colors are exposed as CSS variables:

```css
:root {
  --dc-outer-bg: #F3F3F3;
  --dc-header-color: #B34000;
  --dc-holiday-bg: #FFF0F7;
  --dc-today-border: #B34000;
  /* ... and many more */
}
```

Or programmatically:

```typescript
calendar.setTheme({
  headerColor: '#FF6B35',
  holidayBg: '#FFE5E5',
});
```

## Browser Support

- Chrome/Edge: Latest
- Firefox: Latest
- Safari: Latest
- Requires ES2020+ support

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Acknowledgments

- Date calculations powered by [jalaali-js](https://github.com/jalaali/jalaali-js)
- Design inspired by [time.ir](https://www.time.ir/)
