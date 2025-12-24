import Link from "next/link";
import { Trophy, Calendar, Users, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      
      {/* 🟢 Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[url('https://images.unsplash.com/photo-1615159048733-4903328e6783?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative">
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        <div className="relative z-10 max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Padel<span className="text-lime-400">Pal</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              The ultimate app to book courts, challenge friends, and track your padel ranking. 
              Level up your game today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="bg-lime-400 text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-lime-300 transition flex items-center justify-center gap-2">
                Play Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/signup" className="bg-slate-800/80 backdrop-blur text-white px-8 py-4 rounded-full font-bold text-lg border border-slate-600 hover:bg-slate-700 transition">
                Create Account
              </Link>
            </div>
        </div>
      </main>

      {/* 🟢 Features Grid */}
      <div className="bg-slate-900 py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
            
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-lime-400/50 transition">
                <Calendar className="w-12 h-12 text-lime-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Easy Booking</h3>
                <p className="text-gray-400">Find open courts near you and book instantly. No more phone calls.</p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-lime-400/50 transition">
                <Users className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Social Matches</h3>
                <p className="text-gray-400">Find players at your level. Join open matches or challenge rivals.</p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-lime-400/50 transition">
                <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Rankings & Stats</h3>
                <p className="text-gray-400">Track your wins, earn points, and climb the local leaderboard.</p>
            </div>

        </div>
      </div>

      {/* 🟢 Footer */}
      <footer className="bg-slate-950 py-8 text-center text-gray-500 text-sm">
        <p>© 2025 PadelPal. Built for the community.</p>
      </footer>
    </div>
  );
}