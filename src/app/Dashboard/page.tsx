"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Link from "next/link";
import { Calendar, Plus, CreditCard, LogOut, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setUserData(snap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else {
        // If no user is logged in, wait a moment then redirect
        // (useAuth usually handles this, but this is a safety net)
        const timer = setTimeout(() => {
            if (!user) router.push("/login");
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [user, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading PadelPal...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {userData?.displayName || "Player"}.</p>
        </div>
        <button onClick={handleLogout} className="bg-slate-800 p-2 rounded-full text-red-400 hover:text-red-300 hover:bg-slate-700 transition">
            <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
            <div className="text-gray-400 mb-1 text-xs uppercase tracking-wider font-bold">My Level</div>
            <div className="text-4xl font-bold text-lime-400">{userData?.level || "1.0"}</div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
            <div className="text-gray-400 mb-1 text-xs uppercase tracking-wider font-bold">Wallet</div>
            <div className="text-4xl font-bold text-white">{userData?.balance || 0} <span className="text-sm text-gray-500 font-normal">EGP</span></div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-lime-400" /> Quick Actions
      </h2>
      
      <div className="grid gap-4">
        <Link href="/book/venue-1" className="bg-lime-400 text-slate-900 p-5 rounded-2xl font-bold flex items-center justify-between hover:bg-lime-300 transition shadow-lg shadow-lime-400/10">
            <div className="flex items-center gap-4">
                <div className="bg-slate-900/10 p-2 rounded-lg">
                    <Calendar className="w-6 h-6" />
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-lg leading-tight">Book a Court</span>
                    <span className="text-xs opacity-70 font-normal">Find a match nearby</span>
                </div>
            </div>
            <ArrowRight className="w-5 h-5" />
        </Link>
        
        <Link href="/topup" className="bg-slate-800 text-white p-5 rounded-2xl font-bold flex items-center justify-between border border-slate-700 hover:bg-slate-700 transition">
            <div className="flex items-center gap-4">
                <div className="bg-slate-900/30 p-2 rounded-lg">
                    <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <span>Top Up Wallet</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500" />
        </Link>

        <Link href="/profile" className="bg-slate-800 text-white p-5 rounded-2xl font-bold flex items-center justify-between border border-slate-700 hover:bg-slate-700 transition">
            <div className="flex items-center gap-4">
                <div className="bg-slate-900/30 p-2 rounded-lg">
                    <User className="w-6 h-6 text-purple-400" />
                </div>
                <span>My Profile</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500" />
        </Link>
      </div>
    </div>
  );
}