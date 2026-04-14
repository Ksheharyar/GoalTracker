import Card from '@/components/shared/Card';
import {
  HEATMAP_CELL_SIZE,
  WEEKDAY_LABELS,
  buildHeatmapSlots,
  getWeekdayIndex,
} from './heatmapGrid';

function formatGridDuration(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (minutes === 0) {
    return `${hours}h`;
  }

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

function contributionClass(intensity = 0) {
  switch (intensity) {
    case 3:
      return 'bg-emerald-700 shadow-[0_0_18px_rgba(4,120,87,0.35)]';
    case 2:
      return 'bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.28)]';
    case 1:
      return 'bg-emerald-200/80';
    default:
      return 'bg-slate-300/20';
  }
}

function ContributionGrid({ cells = [], startDate = null }) {
  const { columnCount, slots } = buildHeatmapSlots(cells, startDate);
  const gridStyle =
    columnCount > 0
      ? {
          gridTemplateColumns: `repeat(${columnCount}, ${HEATMAP_CELL_SIZE}px)`,
        }
      : undefined;

  return (
    <Card className="min-w-0 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Challenge timeline</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">Contribution heatmap</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {[
            { label: 'No activity', intensity: 0 },
            { label: 'Partial', intensity: 1 },
            { label: 'Completed', intensity: 2 },
            { label: 'Extra', intensity: 3 },
          ].map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1">
              <span className={`h-3 w-3 rounded-sm ${contributionClass(item.intensity)}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="timeline-wrapper mt-5">
        <div className="heatmap-wrapper">
          <div className="heatmap-weekdays" aria-hidden="true">
            {WEEKDAY_LABELS.map((label, index) => (
              <span key={label}>{index % 2 === 0 ? label : ''}</span>
            ))}
          </div>

          <div className="heatmap-grid" role="grid" aria-label="Contribution heatmap" style={gridStyle}>
            {slots.map(({ cell, column, row, isPlaceholder, key }) => {
              const cellStyle = {
                gridColumnStart: column + 1,
                gridRowStart: row + 1,
              };

              if (isPlaceholder) {
                return <span key={key} className="heatmap-cell empty" aria-hidden="true" style={cellStyle} />;
              }

              const dayNumber = cell.dayNumber || cell.dayIndex + 1;
              const weekdayLabel = WEEKDAY_LABELS[getWeekdayIndex(cell.date)] || 'Day';

              return (
                <div
                  key={key}
                  role="gridcell"
                  title={`${weekdayLabel} · Day ${dayNumber}\nCompleted: ${formatGridDuration(cell.seconds)} / ${formatGridDuration(cell.targetSeconds)}`}
                  aria-label={`${weekdayLabel}, day ${dayNumber}. Completed ${formatGridDuration(cell.seconds)} of ${formatGridDuration(cell.targetSeconds)}`}
                  className={`heatmap-cell transition-transform duration-200 hover:-translate-y-0.5 ${contributionClass(cell.intensity)}`}
                  style={cellStyle}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ContributionGrid;