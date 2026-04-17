'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmEmailVerification } from '@/lib/api/auth';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import BrandMark from '@/components/shared/BrandMark';

function VerifyEmailForm({ token }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError('Verification link is missing.');
        setLoading(false);
        return;
      }

      try {
        await confirmEmailVerification(token);
        setSuccess(true);
      } catch (verifyError) {
        setError(verifyError.message || 'Verification link is invalid or expired.');
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      router.replace('/login?verified=1');
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [router, success]);

  return (
    <Card className="mx-auto w-full max-w-xl border border-white/10 bg-slate-950/50 p-8 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
        <BrandMark showLabel={false} size={18} className="gap-0" />
        <span>GoalTracker</span>
      </div>

      {loading ? <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white">Verifying your email...</h2> : null}

      {success ? (
        <>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white">You are verified. Let’s get started.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">Your account is now active and ready for your first focused streak.</p>
          <p className="mt-2 text-sm leading-7 text-cyan-100">"Small daily progress beats occasional intensity."</p>
          <p className="mt-4 text-sm leading-7 text-slate-300">Taking you to login...</p>
        </>
      ) : null}

      {error ? (
        <>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white">Verification failed</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">{error}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" onClick={() => router.push('/verify-email')}>
              Send another link
            </Button>
            <Link href="/login" className="font-semibold text-cyan-200 hover:text-cyan-100">
              Back to login
            </Link>
          </div>
        </>
      ) : null}
    </Card>
  );
}

export default VerifyEmailForm;