"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { topUpBalance } from "@/services/userService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Lock, CheckCircle } from "lucide-react";

export default function TopUpPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    // Simulate Network Delay (Fake Processing)
    setTimeout(async () => {
        try {
            await topUpBalance(user.uid, amount);
            setSuccess(true);
            // Redirect after 2 seconds
            setTimeout(() => router.push("/dashboard"), 2000);
        } catch (e) {
            alert("Payment Failed");
            setLoading(false);
        }
    }, 1500);
  };

  if (success) {
    return (
        <div className="min-h-screen bg-padel-dark flex flex-col items-center justify-center text-white animate-fade-in">
            <CheckCircle className="w-24 h-24 text-padel-lime mb-6 animate-bounce" />
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-400">Your wallet has been topped up.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-padel-dark text-white p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-white"><ArrowLeft className="w-6 h-6" /></Link>
          <h1 className="text-2xl font-bold">Top Up Wallet</h1>
        </div>

        {/* 💳 Visual Card */}
        <div className="bg-gradient-to-br from-gray-800 to-black p-6 rounded-2xl border border-gray-700 shadow-2xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard className="w-32 h-32 text-white" /></div>
            <div className="text-xs text-gray-400 mb-8 font-mono">PADELPAL SECURE</div>
            <div className="text-2xl font-mono tracking-widest mb-4">•••• •••• •••• 4242</div>
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-[10px] text-gray-500 uppercase">Card Holder</div>
                    <div className="font-bold text-sm">{user?.email?.split('@')[0].toUpperCase()}</div>
                </div>
                <div className="text-xl font-bold text-padel-lime">VISA</div>
            </div>
        </div>

        {/* Amount Selector */}
        <div className="grid grid-cols-3 gap-4 mb-8">
            {[200, 500, 1000].map((val) => (
                <button 
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-3 rounded-xl border font-bold transition ${amount === val ? 'bg-padel-lime text-padel-dark border-padel-lime' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}
                >
                    {val} EGP
                </button>
            ))}
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePayment} className="space-y-4">
            <div>
                <label className="text-xs text-gray-500 font-bold ml-1">CARD NUMBER</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-padel-lime outline-none" />
            </div>
            <div className="flex gap-4">
                <div>
                    <label className="text-xs text-gray-500 font-bold ml-1">EXPIRY</label>
                    <input type="text" placeholder="MM/YY" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-padel-lime outline-none" />
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-bold ml-1">CVC</label>
                    <input type-="text" placeholder="123" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-padel-lime outline-none" />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-padel-lime text-padel-dark font-bold py-4 rounded-xl mt-4 hover:opacity-90 flex items-center justify-center gap-2"
            >
                {loading ? "Processing..." : <><Lock className="w-4 h-4" /> Pay {amount} EGP</>}
            </button>
        </form>

      </div>
    </div>
  );
}