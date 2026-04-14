import Card from '@/components/shared/Card';

function StatCard({ label, value, description, accent = 'cyan' }) {
  const accentStyles = {
    cyan: 'from-cyan-300/20 to-cyan-300/5 text-cyan-100',
    emerald: 'from-emerald-300/20 to-emerald-300/5 text-emerald-100',
    amber: 'from-amber-300/20 to-amber-300/5 text-amber-100',
    rose: 'from-rose-300/20 to-rose-300/5 text-rose-100',
  };

  return (
    <Card className={`bg-gradient-to-br ${accentStyles[accent]} p-6`}>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-white">{value}</p>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p> : null}
    </Card>
  );
}

export default StatCard;