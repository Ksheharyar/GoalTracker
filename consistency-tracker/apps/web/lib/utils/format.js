function pad(value) {
  return String(value).padStart(2, '0');
}

function formatSeconds(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatDurationLabel(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatDateLabel(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatShortDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatPercent(value = 0) {
  return `${Math.round(value)}%`;
}

export {
  formatSeconds,
  formatDurationLabel,
  formatDateLabel,
  formatShortDate,
  formatPercent,
};