import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-padel-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-padel-surface p-8 rounded-3xl shadow-2xl border border-gray-800">
        <div className="text-center mb-8">
          <Link href="/" className="text-padel-lime font-black text-2xl italic mb-4 block">PadelPal</Link>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
