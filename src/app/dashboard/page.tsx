'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold">Welcome to your Dashboard</h1>
      <p className="mt-4">This is your personal space. More features coming soon!</p>
      <Link href="/topup" passHref>
        <button className="mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Top Up Wallet
        </button>
      </Link>
    </div>
  );
}
