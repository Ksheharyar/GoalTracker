const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toISODate(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

function parseISODate(dateKey) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function addDays(date, days) {
  return new Date(new Date(date).getTime() + days * DAY_IN_MS);
}

function differenceInCalendarDays(laterDate, earlierDate) {
  const later = parseISODate(toISODate(laterDate)).getTime();
  const earlier = parseISODate(toISODate(earlierDate)).getTime();
  return Math.round((later - earlier) / DAY_IN_MS);
}

function startOfWeek(date = new Date()) {
  const value = new Date(date);
  const day = value.getUTCDay();
  return addDays(toISODate(value), -day);
}

function startOfMonth(date = new Date()) {
  const value = new Date(date);
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));
}

function endOfMonth(date = new Date()) {
  const value = new Date(date);
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0));
}

function minutesFromSeconds(seconds = 0) {
  return Math.round(seconds / 60);
}

function hoursFromSeconds(seconds = 0) {
  return Number((seconds / 3600).toFixed(2));
}

function formatDuration(seconds = 0) {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function isSameDateKey(left, right) {
  return toISODate(left) === toISODate(right);
}

module.exports = {
  DAY_IN_MS,
  toISODate,
  parseISODate,
  addDays,
  differenceInCalendarDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  minutesFromSeconds,
  hoursFromSeconds,
  formatDuration,
  isSameDateKey,
};