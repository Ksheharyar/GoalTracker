'use client';

import { AuthProvider } from '@/lib/store/auth-store';
import { StopwatchProvider } from '@/lib/store/stopwatch-store';

function Providers({ children }) {
  return (
    <AuthProvider>
      <StopwatchProvider>{children}</StopwatchProvider>
    </AuthProvider>
  );
}

export default Providers;