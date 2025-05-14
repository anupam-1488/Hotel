// src/utils/date.js

// Format date using simple patterns
export function formatDate(date, format) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// Parse date from string
export function parseDate(dateString, format) {
  // Simple implementation - you might want to use a library like date-fns
  return new Date(dateString);
}

// Add days to date
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Add months to date
export function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// Add years to date
export function addYears(date, years) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

// Subtract days from date
export function subDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

// Subtract months from date
export function subMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

// Subtract years from date
export function subYears(date, years) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() - years);
  return result;
}

// Calculate difference between dates
export function dateDiff(date1, date2, unit = 'days') {
  const diff = Math.abs(new Date(date1) - new Date(date2));

  switch (unit) {
    case 'seconds':
      return Math.floor(diff / 1000);
    case 'minutes':
      return Math.floor(diff / (1000 * 60));
    case 'hours':
      return Math.floor(diff / (1000 * 60 * 60));
    case 'days':
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    case 'weeks':
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    case 'months':
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    case 'years':
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    default:
      throw new Error(`Invalid unit: ${unit}`);
  }
}

// Get start of period
export function startOf(date, unit) {
  const result = new Date(date);

  switch (unit) {
    case 'day':
      result.setHours(0, 0, 0, 0);
      break;
    case 'month':
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'year':
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
    default:
      throw new Error(`Invalid unit: ${unit}`);
  }

  return result;
}

// Get end of period
export function endOf(date, unit) {
  const result = new Date(date);

  switch (unit) {
    case 'day':
      result.setHours(23, 59, 59, 999);
      break;
    case 'month':
      result.setMonth(result.getMonth() + 1, 0);
      result.setHours(23, 59, 59, 999);
      break;
    case 'year':
      result.setFullYear(result.getFullYear() + 1, 0, 0);
      result.setHours(23, 59, 59, 999);
      break;
    default:
      throw new Error(`Invalid unit: ${unit}`);
  }

  return result;
}

// Check if date is between two dates
export function isBetween(date, start, end) {
  const d = new Date(date);
  return d >= new Date(start) && d <= new Date(end);
}

// Check if date is after another date
export function isAfter(date1, date2) {
  return new Date(date1) > new Date(date2);
}

// Check if date is before another date
export function isBefore(date1, date2) {
  return new Date(date1) < new Date(date2);
}
