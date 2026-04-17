import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordTokenPage({ params }) {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-6xl">
        <ResetPasswordForm token={params?.token} />
      </div>
    </main>
  );
}