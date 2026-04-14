import AuthForm from '@/components/auth/AuthForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-6xl">
        <Suspense fallback={null}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </main>
  );
}