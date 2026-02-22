/**
 * UI-related constants
 * Centralized configuration for UI elements, styling, and display values
 */

/**
 * Schedule status constants
 */
export const SCHEDULE_STATUS = {
  /** Schedule has passed */
  PASSED: 'passed',
  /** Schedule is for today */
  TODAY: 'today',
  /** Schedule is for tomorrow */
  TOMORROW: 'tomorrow',
  /** Schedule is upcoming */
  UPCOMING: 'upcoming',
} as const;

/**
 * Status badge variants
 */
export const STATUS_BADGE = {
  /** Passed status badge style */
  PASSED: {
    variant: 'secondary' as const,
    className: 'text-[10px] px-1.5 py-0 bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
  },
  /** Today status badge style */
  TODAY: {
    variant: 'default' as const,
    className: 'text-[10px] px-1.5 py-0 bg-primary/20 text-primary hover:bg-primary/30 border-primary/30',
  },
  /** Tomorrow status badge style */
  TOMORROW: {
    variant: 'outline' as const,
    className: 'text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400',
  },
  /** Upcoming status badge style */
  UPCOMING: {
    variant: 'outline' as const,
    className: 'text-[10px] px-1.5 py-0 border-primary/40 text-primary',
  },
} as const;

/**
 * Table row classes based on schedule status
 */
export const TABLE_ROW_CLASSES = {
  /** Passed schedule row */
  PASSED: 'bg-muted/30 text-muted-foreground',
  /** Today schedule row */
  TODAY: 'bg-primary/5 border-l-4 border-l-primary',
  /** Tomorrow schedule row */
  TOMORROW: 'bg-amber-500/5 border-l-4 border-l-amber-500',
  /** Upcoming schedule row */
  UPCOMING: '',
} as const;

/**
 * Card variants for schedule display
 */
export const SCHEDULE_CARD = {
  /** Sehri card style */
  SEHRI: 'card-sehri',
  /** Sehri passed card style */
  SEHRI_PASSED: 'card-sehri-passed opacity-60',
  /** Iftar card style */
  IFTAR: 'card-iftar',
} as const;

/**
 * Color constants for UI elements
 */
export const COLORS = {
  /** Sehri-related colors */
  SEHRI: {
    PRIMARY: 'amber',
    LIGHT: 'amber-500/15',
    DARK: 'amber-600',
    TEXT: 'amber-900',
    TEXT_DARK: 'amber-100',
  },
  /** Iftar-related colors */
  IFTAR: {
    PRIMARY: 'violet',
    LIGHT: 'violet-500/15',
    DARK: 'violet-600',
    TEXT: 'violet-900',
    TEXT_DARK: 'violet-100',
  },
  /** Primary brand colors */
  PRIMARY: {
    LIGHT: 'primary/5',
    MEDIUM: 'primary/20',
    BORDER: 'primary/30',
    BORDER_LIGHT: 'primary/40',
  },
  /** Destructive/action colors */
  DESTRUCTIVE: {
    LIGHT: 'destructive/10',
    MEDIUM: 'destructive/20',
  },
} as const;

/**
 * Icon sizes (in pixels)
 */
export const ICON_SIZES = {
  /** Extra small icon */
  XS: 12,
  /** Small icon */
  SM: 14,
  /** Medium icon */
  MD: 16,
  /** Large icon */
  LG: 20,
  /** Extra large icon */
  XL: 24,
} as const;

/**
 * Button sizes
 */
export const BUTTON_SIZES = {
  /** Extra small button */
  XS: 'h-7 w-7 p-0',
  /** Small button */
  SM: 'h-8 w-8 p-0',
  /** Medium button */
  MD: 'h-9 px-4',
  /** Large button */
  LG: 'h-10 px-6',
} as const;

/**
 * Display text constants
 */
export const DISPLAY_TEXT = {
  /** Today badge text */
  TODAY_BADGE: 'TODAY',
  /** Sehri label */
  SEHRI_LABEL: 'Sehri',
  /** Iftar label */
  IFTAR_LABEL: 'Iftar',
  /** Sehri passed text */
  SEHRI_PASSED: 'Passed — fast has begun',
  /** Sehri upcoming text */
  SEHRI_UPCOMING: 'End time — fast begins',
  /** Iftar start text */
  IFTAR_START: 'Start time — fast breaks',
  /** Hadith section title */
  HADITH_TITLE: 'Hadith of the Day',
  /** Quick links title */
  QUICK_LINKS_TITLE: 'Quick Links',
  /** Full calendar link text */
  FULL_CALENDAR: 'Full Calendar',
  /** No schedule available text */
  NO_SCHEDULE: 'No Schedule Available',
  /** Today's schedule not uploaded */
  TODAY_NOT_UPLOADED: "Today's schedule has not been uploaded yet.",
  /** Tomorrow's schedule not uploaded */
  TOMORROW_NOT_UPLOADED: "Tomorrow's schedule has not been uploaded yet.",
  /** Today's passed schedule title */
  TODAY_PASSED_TITLE: "Today's Passed Schedule",
  /** Today's passed schedule description */
  TODAY_PASSED_DESCRIPTION: "Today's sehri and iftar time have passed. View today's schedule.",
} as const;

/**
 * Display thresholds
 */
export const DISPLAY_THRESHOLDS = {
  /** Maximum entries to display without pagination */
  MAX_ENTRIES_NO_PAGINATION: 50,
  /** Minimum width for desktop layout */
  DESKTOP_MIN_WIDTH: 768,
  /** Minimum width for tablet layout */
  TABLET_MIN_WIDTH: 640,
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  /** Fast animation */
  FAST: 150,
  /** Normal animation */
  NORMAL: 300,
  /** Slow animation */
  SLOW: 500,
} as const;

/**
 * Spacing constants (in Tailwind units)
 */
export const SPACING = {
  /** Extra small spacing */
  XS: 1,
  /** Small spacing */
  SM: 2,
  /** Medium spacing */
  MD: 4,
  /** Large spacing */
  LG: 6,
  /** Extra large spacing */
  XL: 8,
} as const;
