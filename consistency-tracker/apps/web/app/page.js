import Link from 'next/link';
import { ArrowRight, BarChart3, Flame, TimerReset, Zap } from 'lucide-react';
import Card from '@/components/shared/Card';
import BrandMark from '@/components/shared/BrandMark';

const featureCards = [
  {
    icon: TimerReset,
    title: 'Stopwatch sessions',
    description: 'Track focused work with start, pause, stop, and save controls built for momentum.',
  },
  {
    icon: Flame,
    title: 'Consistency grid',
    description: 'See daily activity in a GitHub-style heatmap with glowing intensity by effort.',
  },
  {
    icon: BarChart3,
    title: 'Analytics reports',
    description: 'Weekly and monthly charts show where your time is going and how steady you are.',
  },
  {
    icon: Zap,
    title: 'Goal reminders',
    description: 'Smart reminders surface when you are behind on today’s goal target.',
  },
];

export default function HomePage() {
  return (
    <main className="section-shell min-h-screen overflow-hidden">
      <div className="relative isolate rounded-[40px] border border-white/10 bg-white/[0.04] p-6 shadow-soft backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="absolute inset-0 -z-10 hero-glow rounded-[40px]" />
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <section className="max-w-3xl space-y-8">
            <div className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
              <BrandMark showLabel={false} size={28} className="gap-0" />
              <span className="ml-2">GoalTracker</span>
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                GoalTracker turns disciplined effort into visible momentum.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Build 100-day challenges, run a stopwatch against each goal, and watch your consistency light up
                across a heatmap built for serious focus.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 px-5 py-4 font-semibold text-slate-950 shadow-glow transition-all duration-200 hover:brightness-110"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-4 font-semibold text-slate-100 transition-all duration-200 hover:bg-white/[0.12]"
              >
                Sign in
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: '100%', label: 'Protected JWT routes' },
                { value: '365', label: 'Day contribution view' },
                { value: '2 charts', label: 'Weekly and monthly analytics' },
              ].map((stat) => (
                <Card key={stat.label} className="p-4">
                  <p className="font-display text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-4">
            <Card className="animate-float p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Today</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white">Focus mode</h2>
                </div>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                  Active
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  { value: '02:45', label: 'Tracked' },
                  { value: '01:15', label: 'Remaining' },
                  { value: '7', label: 'Streak' },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/[0.08] bg-white/5 p-4">
                    <p className="font-display text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Contribution heatmap</p>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-4 rounded-md ${index % 5 === 0 ? 'bg-emerald-400/70' : index % 4 === 0 ? 'bg-cyan-300/60' : index % 3 === 0 ? 'bg-cyan-300/30' : 'bg-white/[0.08]'}`}
                  />
                ))}
              </div>
            </Card>
          </section>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="h-full p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}