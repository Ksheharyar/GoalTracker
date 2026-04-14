'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/store/auth-store';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Input from '@/components/shared/Input';
import BrandMark from '@/components/shared/BrandMark';

const formCopy = {
  login: {
    title: 'Welcome back to GoalTracker',
    subtitle: 'Pick up your streak and keep the momentum alive.',
    submitLabel: 'Login',
    footer: 'Need an account?',
    footerHref: '/signup',
    footerLabel: 'Create one',
  },
  signup: {
    title: 'Start your first GoalTracker streak',
    subtitle: 'Create your account and start measuring focused work in minutes.',
    submitLabel: 'Create account',
    footer: 'Already tracking with us?',
    footerHref: '/login',
    footerLabel: 'Login instead',
  },
};

function AuthForm({ mode }) {
  const copy = formCopy[mode];
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/dashboard';
  const { loginUser, signupUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        email: form.email,
        password: form.password,
      };

      if (mode === 'signup') {
        payload.name = form.name;
        await signupUser(payload);
      } else {
        await loginUser(payload);
      }

      router.push(nextUrl);
      router.refresh();
    } catch (submitError) {
      setError(submitError.message || 'Unable to continue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-xl border border-white/10 bg-slate-950/50 p-0">
      <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
        <div className="hero-glow rounded-[28px] p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
            <BrandMark showLabel={false} size={18} className="gap-0" />
            <span>GoalTracker</span>
          </div>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white">{copy.title}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">{copy.subtitle}</p>
          <div className="mt-8 space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-emerald-300" /> JWT protected sessions
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-cyan-300" /> Goal streaks and progress analytics
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-amber-300" /> GitHub-style heatmap dashboard
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] p-6 md:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">{mode}</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">{copy.title}</h3>
          </div>

          {mode === 'signup' ? (
            <Input
              label="Name"
              name="name"
              placeholder="Alex Rivera"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          ) : null}

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="alex@example.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />

          {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Please wait...' : copy.submitLabel}
          </Button>

          <p className="text-center text-sm text-slate-400">
            {copy.footer}{' '}
            <a href={copy.footerHref} className="font-semibold text-cyan-200 hover:text-cyan-100">
              {copy.footerLabel}
            </a>
          </p>
        </form>
      </div>
    </Card>
  );
}

export default AuthForm;