'use client';

import Link from 'next/link';
import { useState } from 'react';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Input from '@/components/shared/Input';
import BrandMark from '@/components/shared/BrandMark';
import { requestPasswordReset } from '@/lib/api/auth';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await requestPasswordReset(email);
      setSuccess(response.message || 'Reset link sent.');
      setEmail('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to send reset link.');
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
        <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white">Check your email</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">{success}</p>
        <div className="mt-8">
          <Link href="/login" className="font-semibold text-cyan-200 hover:text-cyan-100">
            Back to login
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-xl border border-white/10 bg-slate-950/50 p-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
        <BrandMark showLabel={false} size={18} className="gap-0" />
        <span>GoalTracker</span>
      </div>
      <h2 className="mt-6 font-display text-2xl font-semibold text-white">Reset your password</h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">Enter the email on your account and we’ll send a reset link.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="alex@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
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

export default ForgotPasswordForm;