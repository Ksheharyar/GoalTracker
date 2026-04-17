import VerificationRequestForm from '@/components/auth/VerificationRequestForm';
import { Suspense } from 'react';

export default function VerifyEmailRequestPage() {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-6xl">
        <Suspense fallback={null}>
          <VerificationRequestForm />
        </Suspense>
      </div>
    </main>
  );
}