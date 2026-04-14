export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const HEATMAP_ROW_COUNT = 7;
export const HEATMAP_CELL_SIZE = 14;

export function getWeekdayIndex(dateKey) {
  if (!dateKey) {
    return 0;
  }

  const sundayFirstIndex = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
  return (sundayFirstIndex + 6) % HEATMAP_ROW_COUNT;
}

export function buildHeatmapSlots(cells = [], startDate = null) {
  const safeCells = Array.isArray(cells) ? cells : [];
  const startWeekday = startDate ? getWeekdayIndex(startDate) : 0;
  const totalActiveSlots = startWeekday + safeCells.length;
  const columnCount = totalActiveSlots > 0 ? Math.ceil(totalActiveSlots / HEATMAP_ROW_COUNT) : 0;
  const slots = [];

  for (let column = 0; column < columnCount; column += 1) {
    for (let row = 0; row < HEATMAP_ROW_COUNT; row += 1) {
      const dayIndex = column * HEATMAP_ROW_COUNT + row - startWeekday;
      const cell = dayIndex >= 0 && dayIndex < safeCells.length ? safeCells[dayIndex] : null;

      slots.push({
        key: cell ? `${cell.date}-${cell.dayNumber || dayIndex + 1}` : `placeholder-${column}-${row}`,
        cell,
        column,
        row,
        isPlaceholder: !cell,
      });
    }
  }

  return {
    startWeekday,
    columnCount,
    slots,
  };
}