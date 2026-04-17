import VerifyEmailForm from '@/components/auth/VerifyEmailForm';

export default function VerifyEmailTokenPage({ params }) {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-6xl">
        <VerifyEmailForm token={params?.token} />
      </div>
    </main>
  );
}