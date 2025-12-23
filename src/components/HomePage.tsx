'use client';
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-padel-dark text-white flex flex-col relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-96 h-96 bg-padel-court rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-padel-lime rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <h1 className="text-2xl font-black tracking-tighter text-padel-lime italic">
          PadelPal
        </h1>
        <div className="space-x-4">
          {!user ? (
            <>
              <Link href="/login" className="text-gray-300 hover:text-white transition font-medium">Login</Link>
              <Link href="/signup" className="bg-padel-lime text-padel-dark px-5 py-2 rounded-full font-bold hover:opacity-90 transition">
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
               <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
               <button onClick={() => auth.signOut()} className="text-white border border-gray-600 px-4 py-2 rounded-full hover:bg-gray-800 transition">Logout</button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10">
        <span className="text-padel-lime font-bold tracking-widest text-sm uppercase mb-4">The #1 Court Finder</span>
        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
          Book the court. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-padel-lime to-green-400">
            Own the game.
          </span>
        </h2>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
          Find courts near you, challenge friends, and track your stats. 
          The cleanest Padel experience on the web.
        </p>

        <Link href={user ? "/dashboard" : "/signup"} className="bg-white text-padel-dark px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition transform shadow-lg shadow-white/10">
          {user ? "Find a Court" : "Get Started Free"}
        </Link>
      </main>
    </div>
  );
}
