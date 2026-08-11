/**
 * Date utilities for the monitoring system
 */

// Return a formatted date string (e.g., "2025-03-14")
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

// Return a human-readable date-time (e.g., "Mar 14, 2025, 10:30 AM")
const formatDateTime = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

// Difference between two dates in milliseconds
const diffMs = (date1, date2) => {
  return new Date(date2) - new Date(date1);
};

// Difference in days (can be negative)
const diffDays = (date1, date2) => {
  return Math.floor(diffMs(date1, date2) / (1000 * 60 * 60 * 24));
};

// Check if a date is in the past
const isPast = (date) => {
  return new Date(date).getTime() < Date.now();
};

// Check if a date is in the future
const isFuture = (date) => {
  return new Date(date).getTime() > Date.now();
};

// Check if "now" is between two dates
const isBetween = (start, end) => {
  const now = Date.now();
  return now >= new Date(start).getTime() && now <= new Date(end).getTime();
};

// Add days to a date
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

// Add hours to a date
const addHours = (date, hours) => {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

// Convert time string to cron-like expression
const toCron = (date) => {
  const d = new Date(date);
  return `${d.getSeconds()} ${d.getMinutes()} ${d.getHours()} ${d.getDate()} ${d.getMonth() + 1} *`;
};

module.exports = {
  formatDate,
  formatDateTime,
  diffMs,
  diffDays,
  isPast,
  isFuture,
  isBetween,
  addDays,
  addHours,
  toCron,
};