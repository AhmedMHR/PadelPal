'use client';

import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';

export default function AppWrapper({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-padel-dark text-white">
        <div className="text-center">
          <p className="text-2xl font-bold">Loading PadelPal...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
