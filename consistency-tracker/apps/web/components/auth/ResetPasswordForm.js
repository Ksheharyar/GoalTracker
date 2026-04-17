'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Input from '@/components/shared/Input';
import BrandMark from '@/components/shared/BrandMark';
import { confirmPasswordReset } from '@/lib/api/auth';

function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ password: '', passwordConfirm: '' });

  useEffect(() => {
    if (!token) {
      setError('Reset link is missing.');
    }
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (form.password !== form.passwordConfirm) {
      setLoading(false);
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await confirmPasswordReset(token, form.password, form.passwordConfirm);
      setSuccess(response.message || 'Password reset successfully.');
      window.setTimeout(() => {
        router.replace('/login?reset=1');
      }, 1800);
    } catch (resetError) {
      setError(resetError.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="mx-auto w-full max-w-xl border border-white/10 bg-slate-950/50 p-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
          <BrandMark showLabel={false} size={18} className="gap-0" />
          <span>GoalTracker</span>
        </div>
        <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white">Password updated</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">{success} Redirecting you to login...</p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-xl border border-white/10 bg-slate-950/50 p-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
        <BrandMark showLabel={false} size={18} className="gap-0" />
        <span>GoalTracker</span>
      </div>
      <h2 className="mt-6 font-display text-2xl font-semibold text-white">Set a new password</h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat password"
          value={form.passwordConfirm}
          onChange={(event) => setForm({ ...form, passwordConfirm: event.target.value })}
          required
        />

        {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

        <Button type="submit" className="w-full" size="lg" disabled={loading || !token}>
          {loading ? 'Resetting...' : 'Reset password'}
        </Button>

        <p className="text-center text-sm text-slate-400">
          <Link href="/login" className="font-semibold text-cyan-200 hover:text-cyan-100">
            Back to login
          </Link>
        </p>
      </form>
    </Card>
  );
}

export default ResetPasswordForm;