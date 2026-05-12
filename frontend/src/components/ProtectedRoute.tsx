import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'vendor' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, accessToken } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand to rehydrate from localStorage before deciding to redirect.
  // Without this, payment callbacks (e.g. Paystack redirect) arrive before the
  // store has loaded the saved token, causing a false login redirect.
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    // If already hydrated (e.g. navigating internally), mark immediately.
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin" />
      </div>
    );
  }

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
