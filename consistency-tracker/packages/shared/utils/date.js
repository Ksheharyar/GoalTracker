const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toISODate(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

function addDays(date, days) {
  return new Date(new Date(date).getTime() + days * DAY_IN_MS);
}

function differenceInDays(laterDate, earlierDate) {
  const later = new Date(toISODate(laterDate)).getTime();
  const earlier = new Date(toISODate(earlierDate)).getTime();
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

module.exports = {
  DAY_IN_MS,
  toISODate,
  addDays,
  differenceInDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
};