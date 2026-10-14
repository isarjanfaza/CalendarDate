/**
 * CalendarDate - Internationalization (i18n) translations
 */

export type Locale = 'en' | 'fr' | 'de';

export interface Translations {
  months: {
    full: string[];
    short: string[];
  };
  weekdays: {
    short: string[];
    full: string[];
  };
  ui: {
    today: string;
    previous: string;
    next: string;
    selectYear: string;
    selectMonth: string;
    enterYear: string;
    go: string;
    holidaysThisMonth: string;
    noHolidaysThisMonth: string;
    holidays: string;
    religious: string;
    national: string;
    international: string;
    historical: string;
    personal: string;
  };
}

export const translations: Record<Locale, Translations> = {
  en: {
    months: {
      full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    weekdays: {
      short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    ui: {
      today: 'Go to Today',
      previous: 'Previous',
      next: 'Next',
      selectYear: 'Select year',
      selectMonth: 'Select month',
      enterYear: 'Enter year',
      go: 'Go',
      holidaysThisMonth: 'Holidays this month',
      noHolidaysThisMonth: 'No holidays this month',
      holidays: 'Holidays',
      religious: 'Religious',
      national: 'National',
      international: 'International',
      historical: 'Historical',
      personal: 'Personal',
    },
  },
  fr: {
    months: {
      full: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      short: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    },
    weekdays: {
      short: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      full: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    },
    ui: {
      today: 'Aujourd\'hui',
      previous: 'Précédent',
      next: 'Suivant',
      selectYear: 'Sélectionner l\'année',
      selectMonth: 'Sélectionner le mois',
      enterYear: 'Entrer l\'année',
      go: 'Aller',
      holidaysThisMonth: 'Jours fériés ce mois',
      noHolidaysThisMonth: 'Aucun jour férié ce mois',
      holidays: 'Jours fériés',
      religious: 'Religieux',
      national: 'National',
      international: 'International',
      historical: 'Historique',
      personal: 'Personnel',
    },
  },
  de: {
    months: {
      full: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      short: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    },
    weekdays: {
      short: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      full: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    },
    ui: {
      today: 'Heute',
      previous: 'Vorherige',
      next: 'Nächste',
      selectYear: 'Jahr auswählen',
      selectMonth: 'Monat auswählen',
      enterYear: 'Jahr eingeben',
      go: 'Los',
      holidaysThisMonth: 'Feiertage diesen Monat',
      noHolidaysThisMonth: 'Keine Feiertage diesen Monat',
      holidays: 'Feiertage',
      religious: 'Religiös',
      national: 'National',
      international: 'International',
      historical: 'Historisch',
      personal: 'Persönlich',
    },
  },
};

/**
 * Get translations for a specific locale
 */
export function getTranslations(locale: Locale = 'en'): Translations {
  return translations[locale] || translations.en;
}

/**
 * Get localized month name
 */
export function getMonthName(month: number, locale: Locale = 'en', short = false): string {
  const t = getTranslations(locale);
  const months = short ? t.months.short : t.months.full;
  return months[month] || '';
}

/**
 * Get localized weekday name
 */
export function getWeekdayName(day: number, locale: Locale = 'en', short = false): string {
  const t = getTranslations(locale);
  const weekdays = short ? t.weekdays.short : t.weekdays.full;
  return weekdays[day] || '';
}
