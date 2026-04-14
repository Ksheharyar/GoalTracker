import { BellRing, Sparkles } from 'lucide-react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';

function ReminderBanner({ reminder, onRefresh }) {
  if (!reminder?.shouldRemind) {
    return null;
  }

  return (
    <Card className="border-amber-300/20 bg-gradient-to-r from-amber-300/12 to-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-200 ring-1 ring-amber-300/20">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Reminder</p>
            <h3 className="mt-2 font-display text-xl font-semibold text-white">Stay on pace today</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">{reminder.message}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={onRefresh}>
          <Sparkles className="h-4 w-4" /> Refresh
        </Button>
      </div>
    </Card>
  );
}

export default ReminderBanner;