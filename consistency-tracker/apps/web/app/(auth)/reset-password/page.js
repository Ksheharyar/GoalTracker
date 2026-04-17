import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Suspense } from 'react';

export default function ResetPasswordRequestPage() {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-6xl">
        <Suspense fallback={null}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}