export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Checks if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Gets maximum days in a given month and year
 */
export function getDaysInMonth(month: number, year: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

/**
 * Formats YYYY-MM-DD string to friendly format e.g. "1 August 1985"
 */
export function formatDateFriendly(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${MONTH_NAMES[monthIdx] || ''} ${year}`;
}

/**
 * Returns current year (e.g. 2026)
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Formats a Date using its local calendar fields, avoiding UTC day shifts.
 */
export function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Returns max available date for historical weather queries (yesterday)
 */
export function getMaxHistoricalDate(): string {
  const today = new Date();
  today.setDate(today.getDate() - 1); // Yesterday
  return formatLocalDate(today);
}

/**
 * Ensures an Archive API end date never points past the available historical limit.
 */
export function clampToMaxHistoricalDate(dateStr: string): string {
  const maxHistoricalDate = getMaxHistoricalDate();
  return dateStr < maxHistoricalDate ? dateStr : maxHistoricalDate;
}

/**
 * Returns the final calendar date for a month.
 */
export function getMonthEndDate(year: number, month: number): string {
  return `${year}-${pad2(month)}-${pad2(getDaysInMonth(month, year))}`;
}

/**
 * Generates array of years from startYear to endYear
 */
export function getYearsArray(startYear: number, endYear: number): number[] {
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  return years;
}

/**
 * Pads number with leading zero e.g. 5 -> "05"
 */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
