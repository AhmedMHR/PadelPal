'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { topUpWallet } from '@/app/actions';

export default function TopUp() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleTopUp = async () => {
    if (!user) {
      setMessage('You must be logged in to top up your wallet.');
      return;
    }

    const topUpAmount = parseInt(amount, 10);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      setMessage('Please enter a valid amount.');
      return;
    }

    const result = await topUpWallet(user.uid, topUpAmount);
    if (result.success) {
      setAmount('');
      setMessage(result.message || 'Top-up successful!');
    } else {
      setMessage(result.message || 'Top-up failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold">Top Up Your Wallet</h1>
      <div className="mt-8">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="bg-slate-800 text-white p-2 rounded-md w-full"
        />
        <button
          onClick={handleTopUp}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Top Up
        </button>
        {message && <p className="mt-4 text-green-500">{message}</p>}
      </div>
    </div>
  );
}
