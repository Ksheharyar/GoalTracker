'use client';

import { AuthProvider } from '@/lib/store/auth-store';

function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default Providers;