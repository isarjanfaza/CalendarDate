# dualcal

تقویم دوگانه فارسی (جلالی) + میلادی - یک کتابخانه TypeScript مستقل از فریم‌ورک.

## 📄 درباره این پروژه

این برنامه توسط **ایثار جانفaza** تهیه شده است.

## ❤️ حمایت از توسعه‌دهنده

در صورت تمایل جهت حمایت از من، می‌توانید هدیه‌ای را به شماره شبا زیر واریز کنید:

**شماره شبا:** `IR60017000000034348067607`

هر مبلغی به توسعه و بهبود این پروژه کمک می‌کند. سپاسگزارم! 🙏

---

## ویژگی‌ها

- 📅 نمایش همزمان تاریخ جلالی و میلادی در هر سلول
- 🎨 طراحی زیبا به سبک تقویم رومیزی الهام گرفته از time.ir
- 🌙 پشتیبانی از حالت تاریک با CSS variables
- ⌨️ پشتیبانی کامل از کیبورد (فلش‌ها، Enter/Space، PageUp/PageDown)
- 🎯 قابلیت شخصی‌سازی تم با CSS variables
- 📋 پشتیبانی از تعطیلات با اعتبارسنجی و رویدادهای تکرار شونده
- 🔔 نقاط رویداد برای رویدادهای سفارشی
- 🌐 چیدمان راست‌چین (RTL) به صورت پیش‌فرض
- 📱 طراحی واکنش‌گرا
- 🏗️ مستقل از فریم‌ورک (کار با vanilla JS، React، Vue و غیره)
- 🧪 پوشش آزمایشی جامع
- 📦 بدون وابستگی‌های runtime (فقط peer dependency: `jalaali-js`)
- 🌙 پشتیبانی کامل از تعطیلات قمری با تقویم islamic-umalqura
- ℹ️ Popover مناسبت‌های ماه با دکمه info
- 🎭 گروه‌بندی مناسبت‌ها (تعطیلات، مذهبی، ملی، جهانی، تاریخی، شخصی)
- 🔢 سال نویس با پشتیبانی از کلید ENTER

## نصب

```bash
npm install dualcal jalaali-js
```

## شروع سریع

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
      weekendDays: [5], // جمعه
      showHijri: true,
      gregorianDigits: 'latin',
      onDayClick: (date, jalaliDate) => {
        console.log('انتخاب شده:', date, jalaliDate);
      },
    });
  </script>
</body>
</html>
```

## API

### `createDualCalendar(container, options?)`

یک نمونه جدید از DualCalendar ایجاد می‌کند.

**پارامترها:**

- `container: HTMLElement` - المان DOM برای رندر تقویم
- `options?: DualCalendarOptions` - گزینه‌های پیکربندی

**بازگشت:** `DualCalendarInstance`

### گزینه‌ها

```typescript
interface DualCalendarOptions {
  holidays?: HolidayEntry[] | string;  // آرایه یا URL/رشته JSON
  weekendDays?: number[];               // پیش‌فرض: [5] (جمعه)
  initialDate?: Date | string;          // ISO میلادی یا جلالی "1405/07/20"
  events?: EventEntry[];                // رویدادهای سفارشی با نقاط
  theme?: Partial<DualCalTheme>;        // رنگ‌های تم سفارشی
  showHijri?: boolean;                  // پیش‌فرض: false
  gregorianDigits?: 'latin' | 'persian'; // پیش‌فرض: 'latin'
  monthListMode?: 'popover' | 'inline'; // پیش‌فرض: 'popover'
  onDayClick?: (date: Date, jalaliDate: JalaaliDate) => void;
  onMonthChange?: (jalaliDate: JalaaliDate) => void;
}
```

### متدهای نمونه

```typescript
instance.getDate(): Date;              // دریافت تاریخ فعلی
instance.goTo(date: Date | string);    // رفتن به تاریخ خاص
instance.goToToday();                  // رفتن به امروز
instance.next();                       // ماه بعد
instance.prev();                       // ماه قبل
instance.setHolidays(holidays);        // بروزرسانی تعطیلات
instance.setEvents(events);            // بروزرسانی رویدادها
instance.setTheme(theme);              // بروزرسانی تم
instance.destroy();                    // پاکسازی
```

## اسکیمای تعطیلات

```json
{
  "holidays": [
    {
      "date": "1405/07/20",
      "calendar": "jalali",
      "title": "تولد من",
      "recurring": false,
      "type": "personal",
      "holiday": true,
      "description": "توضیحات اختیاری"
    },
    {
      "date": "07/20",
      "calendar": "jalali",
      "title": "تولد من (سالانه)",
      "recurring": true,
      "type": "personal",
      "holiday": false
    },
    {
      "date": "2026-12-25",
      "calendar": "gregorian",
      "title": "Christmas",
      "recurring": false,
      "type": "international",
      "holiday": false
    },
    {
      "date": "01/10",
      "calendar": "hijri",
      "title": "عید سعید فطر",
      "recurring": true,
      "type": "religious",
      "holiday": true
    }
  ],
  "hijri": {
    "offset": 0,
    "monthStarts": {
      "1448-02": "2027-09-12"
    },
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

### فیلدهای تعطیلات

- `date`: تاریخ مناسبت (فرمت بسته به `calendar` متفاوت است)
- `calendar`: نوع تقویم - `"jalali"` (شمسی)، `"gregorian"` (میلادی)، یا `"hijri"` (قمری)
- `title`: عنوان مناسبت
- `recurring`: آیا تکرار شونده است؟ (برای تاریخ‌های دقیق غیرتکرار شونده `false`، برای تاریخ‌های ماه/روز `true`)
- `type`: نوع مناسبت - `"official"` (رسمی)، `"religious"` (مذهبی)، `"national"` (ملی و باستانی)، `"international"` (جهانی)، `"historical"` (تاریخی)، یا `"personal"` (شخصی)
- `holiday`: آیا روز تعطیل است؟ (اگر `true` باشد، سلول قرمز می‌شود)

### Popover مناسبت‌های ماه

با گزینه `monthListMode: 'popover'` (پیش‌فرض)، یک دکمه "i" در گوشه تقویم نمایش داده می‌شود که با کلیک روی آن، popover مناسبت‌های ماه باز می‌شود. مناسبت‌ها به صورت گروه‌بندی شده نمایش داده می‌شوند:

- تعطیلات (رنگ قرمز)
- مذهبی
- ملی و باستانی
- جهانی
- تاریخی
- شخصی

برای نمایش لیست قدیمی زیر تقویم، از `monthListMode: 'inline'` استفاده کنید.

### پشتیبانی از تعطیلات قمری

تعطیلات قمری با `"calendar": "hijri"` و فرمت `"date": "MM/DD"` (ماه/روز قمری) تعریف می‌شوند. این تعطیلات همیشه تکرار شونده هستند و با استفاده از `Intl.DateTimeFormat` مرورگر با تقویم `islamic-umalqura` با هر روز میلادی قابل مشاهده تطبیق داده می‌شوند.

**مهم:** تاریخ‌های قمری رسمی ایران به رویت ماه بستگی دارد و هر سال ممکن است تغییر کند. پیاده‌سازی تقویم قمری `Intl` ممکن است ۱-۲ روز با تقویم رسمی ایران اختلاف داشته باشد. شما باید هر سال تاریخ‌های قمری را بررسی کنید و از تنظیمات `monthStarts` و `overrides` برای هماهنگی با منابع رسمی استفاده کنید.

**پیکربندی قمری:**

- `hijri.offset`: تعداد روز آفست برای محاسبات قمری (مثلاً `+1` برای جلو بردن همه تعطیلات قمری یک روز)
- `hijri.monthStarts`: نقشه اختیاری برای دقت بیشتر - کلید فرمت `"YYYY-MM"` (ماه قمری) و مقدار تاریخ شروع میلادی ISO (مثلاً `"1448-02": "2027-09-12"`). اگر یک ماه در این نقشه نباشد، از `Intl` به عنوان fallback استفاده می‌شود.
- `hijri.overrides`: آرایه‌ای از overrideها برای پین کردن تعطیلات قمری خاص به تاریخ‌های دقیق برای یک سال. overrideها از فرمت `{ "hijri": "MM/DD", "date": "YYYY/MM/DD" }` استفاده می‌کنند که `date` می‌تواند فرمت جلالی یا ISO میلادی باشد. overrideها تطبیق محاسبه‌شده قمری را برای آن سال حذف می‌کنند.

## شخصی‌سازی تم

تمام رنگ‌ها به عنوان CSS variables در دسترس هستند:

```css
:root {
  --dc-outer-bg: #F3F3F3;
  --dc-header-color: #B34000;
  --dc-holiday-bg: #FFF0F7;
  --dc-today-border: #B34000;
  /* ... و بسیاری دیگر */
}
```

یا به صورت برنامه‌نویسی:

```typescript
calendar.setTheme({
  headerColor: '#FF6B35',
  holidayBg: '#FFE5E5',
});
```

## پشتیبانی مرورگر

- Chrome/Edge: آخرین نسخه
- Firefox: آخرین نسخه
- Safari: آخرین نسخه
- نیاز به پشتیبانی ES2020+

## مجوز

MIT

## مشارکت

مشارکت‌ها خوش‌آمد هستند! لطفاً قبل از ارسال PR، راهنمای مشارکت ما را مطالعه کنید.

## قدردانی‌ها

- محاسبات تاریخ با قدرت [jalaali-js](https://github.com/jalaali/jalaali-js)
- طراحی الهام گرفته از [time.ir](https://www.time.ir/)
