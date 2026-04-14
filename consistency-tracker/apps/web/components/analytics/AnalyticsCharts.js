'use client';

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Card from '@/components/shared/Card';
import StatCard from '@/components/shared/StatCard';
import { formatDurationLabel } from '@/lib/utils/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, ArcElement, BarElement);

function chartOptions(labelColor) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(4, 12, 24, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(104, 225, 253, 0.2)',
        borderWidth: 1,
        callbacks: {
          label(context) {
            const value = Number(context.parsed.y ?? context.parsed ?? 0);
            return `${context.dataset.label || 'Time'}: ${formatDurationLabel(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: labelColor },
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
      },
      y: {
        ticks: { color: labelColor },
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
        beginAtZero: true,
        suggestedMax: undefined,
        ticks: {
          color: labelColor,
          callback(value) {
            return `${Math.round(Number(value) / 3600)}h`;
          },
        },
      },
    },
  };
}

function progressionChartOptions(labelColor, mode = 'percentage') {
  const isPercentageMode = mode === 'percentage';
  const base = chartOptions(labelColor);
  return {
    ...base,
    plugins: {
      ...base.plugins,
      legend: {
        display: true,
        labels: {
          color: '#cbd5e1',
        },
      },
      tooltip: {
        ...base.plugins.tooltip,
        callbacks: {
          label(context) {
            const value = Number(context.parsed.y ?? 0);
            return isPercentageMode
              ? `${context.dataset.label || 'Value'}: ${Math.round(value)}%`
              : `${context.dataset.label || 'Value'}: ${formatDurationLabel(value)}`;
          },
        },
      },
    },
    scales: {
      ...base.scales,
      y: {
        ...base.scales.y,
        min: 0,
        ...(isPercentageMode ? { max: 200 } : {}),
        ticks: {
          color: labelColor,
          callback(value) {
            return isPercentageMode ? `${value}%` : `${Math.round(Number(value) / 3600)}h`;
          },
        },
      },
    },
  };
}

function AnalyticsCharts({ analytics }) {
  const progressionMode = analytics?.progressionMode || (analytics?.scope === 'goal' ? 'percentage' : 'seconds');
  const showProgressTarget = (analytics?.progressionSeries || []).some((item) => Number(item.targetSeconds || 0) > 0);

  const weekdayData = {
    labels: analytics?.weekdayBreakdown?.labels || [],
    datasets: [
      {
        label: 'Weekday total',
        data: analytics?.weekdayBreakdown?.values || [],
        backgroundColor: [
          'rgba(56, 189, 248, 0.9)',
          'rgba(45, 212, 191, 0.9)',
          'rgba(34, 197, 94, 0.9)',
          'rgba(132, 204, 22, 0.9)',
          'rgba(250, 204, 21, 0.9)',
          'rgba(251, 146, 60, 0.9)',
          'rgba(248, 113, 113, 0.9)',
        ],
        borderColor: 'rgba(15, 23, 42, 0.95)',
        borderWidth: 2,
      },
    ],
  };

  const monthlyData = {
    labels: (analytics?.monthlyWeekBars || []).map((item) => item.label),
    datasets: [
      {
        label: 'Actual',
        data: (analytics?.monthlyWeekBars || []).map((item) => Number(item.actualSeconds || 0)),
        backgroundColor: 'rgba(45, 212, 191, 0.7)',
        borderRadius: 12,
      },
      {
        label: 'Target',
        data: (analytics?.monthlyWeekBars || []).map((item) => Number(item.targetSeconds || 0)),
        backgroundColor: 'rgba(148, 163, 184, 0.4)',
        borderRadius: 12,
      },
    ],
  };

  const progressionData = {
    labels: (analytics?.progressionSeries || []).map((item) => item.date),
    datasets: [
      {
        label: progressionMode === 'percentage' ? 'Daily completion' : 'Tracked time',
        data: (analytics?.progressionSeries || []).map((item) => (
          progressionMode === 'percentage'
            ? Number(item.completionPercentage || 0)
            : Number(item.actualSeconds || 0)
        )),
        fill: true,
        borderColor: '#68e1fd',
        backgroundColor: 'rgba(104, 225, 253, 0.16)',
        tension: 0.35,
        pointRadius: 0,
      },
      ...(showProgressTarget
        ? [{
            label: progressionMode === 'percentage' ? 'Target line' : 'Baseline',
            data: (analytics?.progressionSeries || []).map((item) => (
              progressionMode === 'percentage' ? 100 : Number(item.targetSeconds || 0)
            )),
            fill: false,
            borderColor: 'rgba(148, 163, 184, 0.7)',
            borderDash: [8, 8],
            pointRadius: 0,
          }]
        : []),
    ],
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Weekday breakdown</p>
        <div className="mt-4 h-80">
          <Doughnut
            data={weekdayData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#cbd5e1',
                  },
                },
                tooltip: {
                  backgroundColor: 'rgba(4, 12, 24, 0.95)',
                  callbacks: {
                    label(context) {
                      const value = Number(context.parsed || 0);
                      return `${context.label}: ${formatDurationLabel(value)}`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Monthly 4-week bars</p>
        <div className="mt-4 h-80">
          <Bar data={monthlyData} options={chartOptions('#cbd5e1')} />
        </div>
      </Card>

      <Card className="p-5 sm:p-6 xl:col-span-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Progression from start to today</p>
        <div className="mt-4 h-80">
          <Line data={progressionData} options={progressionChartOptions('#cbd5e1', progressionMode)} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 xl:col-span-2">
        <StatCard label="Consistency" value={`${analytics?.consistencyPercentage || 0}%`} accent="emerald" />
        <StatCard label="Longest streak" value={`${analytics?.longestStreak || 0} days`} accent="cyan" />
        <StatCard label="Current streak" value={`${analytics?.currentStreak || 0} days`} accent="amber" />
      </div>
    </div>
  );
}

export default AnalyticsCharts;